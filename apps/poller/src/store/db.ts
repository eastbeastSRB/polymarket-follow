/**
 * The database on the shared MongoDB server (COLLECTOR-PLAN §1.2): what is
 * queried — the boards, the competition table, the universe, the rule book.
 * Every write is queued and none is awaited by a read of the API: a database
 * outage loses no reply, since the hourly files keep every one. Only our own
 * names are accepted, so no other database is ever written (Iron Rule 2: the
 * lab's lives on the same server). Zod is the schema of every document.
 */
import { MongoClient, MongoServerError, type Db } from "mongodb";
import { z } from "zod";
import {
  CompetitionLeaderboardPage,
  CompetitionReply,
  LeaderboardPage,
} from "../api/schemas.js";
import type { Logger } from "../log.js";
import { universeUpdates, type Sighting } from "./universe.js";

export const DB_NAMES = /^polymarket_follow(_test)?$/;

export function checkDbName(name: string): string {
  if (!DB_NAMES.test(name)) {
    throw new Error(
      `database ${name}: only polymarket_follow or polymarket_follow_test`,
    );
  }
  return name;
}

const int = z.number().int();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** One board of one pass, `board_snapshots`. */
export const BoardSnapshot = z.object({
  passDate: date,
  window: z.string(),
  sort: z.string(),
  /** The UTC date of the board's snapshot (its earliest page's stamp), never our clock's. */
  day: date,
  pages: z.array(
    z.object({
      offset: int,
      timestamp: int,
      total: int,
      readAt: int,
      rows: int,
    }),
  ),
  /** As parsed, addresses lower-cased; one row an account, the first page's. */
  rows: z.array(LeaderboardPage.shape.entries.element),
  /** The pages' snapshot stamps lie within 10 s of each other. */
  consistent: z.boolean(),
  /** Every page was read, to the list's end or its 1,000th row. */
  complete: z.boolean(),
  /** A page's snapshot was old at read, or the top 100 are the day before's (jobs/board-pass.ts). */
  stale: z.boolean(),
});
export type BoardSnapshot = z.infer<typeof BoardSnapshot>;
const StoredBoardTop = BoardSnapshot.pick({ rows: true });

/** One competition's table in one pass, `competition_snapshots`. */
export const CompetitionSnapshot = z.object({
  passDate: date,
  competition_id: int,
  competition: CompetitionReply.nullable(),
  total: int,
  updated_at: int.nullable(),
  pages: z.array(
    z.object({
      offset: int,
      total: int,
      updated_at: int.nullable(),
      readAt: int,
      rows: int,
    }),
  ),
  rows: z.array(CompetitionLeaderboardPage.shape.entries.element),
  complete: z.boolean(),
});
export type CompetitionSnapshot = z.infer<typeof CompetitionSnapshot>;

/** One address of the universe, `_id` lower-cased; `sources` keyed by `boardSource`/`competitionSource`. */
export const UniverseDoc = z.object({
  _id: z.string().regex(/^0x[0-9a-f]{40}$/),
  sources: z.record(
    z.string(),
    z.object({ first: date, last: date }) satisfies z.ZodType<Sighting>,
  ),
});
export type UniverseDoc = z.infer<typeof UniverseDoc>;

const StoredBoardKey = z.object({ window: z.string(), sort: z.string() });
const StoredRule = z.object({ value: z.unknown() });

/** JSON with every object's keys sorted: equal exactly when the values are. */
export function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v !== null && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(
          Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
        )
      : v,
  );
}

export class Store {
  readonly counts = { done: 0, failed: 0, waiting: 0, refused: 0 };
  private work: Promise<void> = Promise.resolve();
  private paused = false;
  private indexed = false;
  /** The latest stored value of each rule, as canonical JSON. */
  private readonly rules = new Map<string, string>();

  private constructor(
    private readonly client: MongoClient,
    private readonly db: Db,
    private readonly log: Logger,
  ) {}

  /** Connects lazily: a server down at start delays the writes, not the poller. */
  static open(uri: string, name: string, log: Logger): Store {
    const client = new MongoClient(uri, {
      appName: "polymarket-follow",
      serverSelectionTimeoutMS: 10_000,
      ignoreUndefined: true,
    });
    return new Store(client, client.db(checkDbName(name)), log);
  }

  saveBoard(doc: BoardSnapshot): void {
    this.enqueue("board_snapshots", (db) =>
      this.insertOnce(db, "board_snapshots", doc),
    );
  }

  saveCompetition(doc: CompetitionSnapshot): void {
    this.enqueue("competition_snapshots", (db) =>
      this.insertOnce(db, "competition_snapshots", doc),
    );
  }

  /** The universe: where each address was seen, on which date. */
  noteSeen(accounts: readonly string[], source: string, day: string): void {
    if (accounts.length === 0) return;
    this.enqueue("universe", async (db) => {
      await db
        .collection<UniverseDoc>("universe")
        .bulkWrite(universeUpdates(accounts, source, day), { ordered: false });
    });
  }

  /**
   * The rule book (§1.3 item 2): a value is stored when it differs from the
   * latest stored one of its kind and key; `beside` is stored with it, not
   * compared (the reply's `date` and `age`, a sequence).
   */
  noteRule(
    kind: string,
    key: string,
    value: unknown,
    at: number,
    beside: Record<string, unknown> = {},
  ): void {
    const id = `${kind} ${key}`;
    const text = canonical(value);
    if (this.rules.get(id) === text) return;
    this.enqueue("rulebook", async (db) => {
      const rulebook = db.collection("rulebook");
      if (!this.rules.has(id)) {
        const latest = await rulebook.findOne(
          { kind, key },
          { sort: { at: -1 }, projection: { _id: 0, value: 1 } },
        );
        if (latest !== null) {
          this.rules.set(id, canonical(StoredRule.parse(latest).value));
        }
      }
      if (this.rules.get(id) === text) return;
      await rulebook.insertOne({ ...beside, kind, key, at, value });
      this.rules.set(id, text);
    });
  }

  /** A rule-book event, stored each time (a server's close of a connection). */
  noteEvent(kind: string, key: string, value: unknown, at: number): void {
    this.enqueue("rulebook", async (db) => {
      await db.collection("rulebook").insertOne({ kind, key, at, value });
    });
  }

  /** A stored board's first `n` rows; null when the pass date has none or the server cannot say. */
  async boardTop(
    passDate: string,
    board: { window: string; sort: string },
    n: number,
  ): Promise<BoardSnapshot["rows"] | null> {
    try {
      const doc = await this.db
        .collection("board_snapshots")
        .findOne(
          { passDate, window: board.window, sort: board.sort },
          { projection: { _id: 0, rows: { $slice: n } } },
        );
      return doc === null ? null : StoredBoardTop.parse(doc).rows;
    } catch (err) {
      // A schema issue can quote a row's value, which a log never holds (§1.3 item 7).
      const reason =
        err instanceof z.ZodError
          ? `${err.issues.length} schema issue(s)`
          : String(err);
      this.log.warn(
        { reason, passDate, board: `${board.window}:${board.sort}` },
        "the day before's board not read; judged by its page stamps only",
      );
      return null;
    }
  }

  /** `window:sort` of the boards a pass date already holds; none if the server cannot say. */
  async boardsStored(passDate: string): Promise<Set<string>> {
    try {
      const docs = await this.db
        .collection("board_snapshots")
        .find({ passDate }, { projection: { _id: 0, window: 1, sort: 1 } })
        .toArray();
      return new Set(
        docs.map((d) => {
          const { window, sort } = StoredBoardKey.parse(d);
          return `${window}:${sort}`;
        }),
      );
    } catch (err) {
      this.log.warn({ err }, "stored boards not read; every board is read");
      return new Set();
    }
  }

  /** Waits for the queued writes, then closes the connections. */
  async close(): Promise<void> {
    await this.work;
    await this.client.close();
  }

  /** While the database's disk is low (health/disk.ts) no write is queued; each is counted, its reply stays in the files. */
  pauseWrites(paused: boolean): void {
    this.paused = paused;
  }

  private enqueue(what: string, write: (db: Db) => Promise<void>): void {
    if (this.paused) {
      this.counts.refused += 1;
      return;
    }
    this.counts.waiting += 1;
    this.work = this.work.then(async () => {
      try {
        await this.ensureIndexes();
        await write(this.db);
        this.counts.done += 1;
      } catch (err) {
        this.counts.failed += 1;
        this.log.error(
          { err, what },
          "database write failed; the files keep the reply",
        );
      } finally {
        this.counts.waiting -= 1;
      }
    });
  }

  /** A pass resumed after a restart can meet its own earlier document: the first one stays. */
  private async insertOnce(
    db: Db,
    collection: string,
    doc: object,
  ): Promise<void> {
    try {
      await db.collection(collection).insertOne({ ...doc });
    } catch (err) {
      if (err instanceof MongoServerError && err.code === 11000) {
        this.log.info({ collection }, "already stored; the first one stays");
        return;
      }
      throw err;
    }
  }

  private async ensureIndexes(): Promise<void> {
    if (this.indexed) return;
    await this.db
      .collection("board_snapshots")
      .createIndex({ passDate: 1, window: 1, sort: 1 }, { unique: true });
    await this.db
      .collection("competition_snapshots")
      .createIndex({ passDate: 1, competition_id: 1 }, { unique: true });
    await this.db
      .collection("rulebook")
      .createIndex({ kind: 1, key: 1, at: -1 });
    this.indexed = true;
  }
}
