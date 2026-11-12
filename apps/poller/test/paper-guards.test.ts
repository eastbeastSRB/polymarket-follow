/**
 * Guards that deliberate breaks of the code found missing (PAPER-CODE-REVIEW
 * M6; decisions 2026-11-12, the two fresh reviews (12)): each test pins, with
 * literal values, a number or a rule that decides or is frozen.
 */
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { afterAll, describe, expect, it } from "vitest";
import { accountData, fillsBefore, mondayFacts } from "../src/paper/account.js";
import { backupPaper } from "../src/paper/backup.js";
import {
  DAYS7_MS,
  jumpRatio,
  planCopyThrough,
  stopInstant,
} from "../src/paper/copy.js";
import { loadCache, scoreInput } from "../src/paper/daily.js";
import { FROZEN_SCOPE, verifyFreeze } from "../src/paper/gate.js";
import { CUT, mondayOf } from "../src/paper/instants.js";
import { ALARM_STOP_ROWS, readThrough } from "../src/paper/loop.js";
import { loadPrecut } from "../src/paper/market.js";
import { PAGE_ROWS, renderPage, type PageData } from "../src/paper/page.js";
import { paperRequest, readFills } from "../src/paper/reader.js";
import {
  RESEARCH_ROOT,
  loadResearch,
  type Fill,
} from "../src/paper/research.js";
import { parseRuleBook } from "../src/paper/rulebook.js";
import { PAPER_LOCK } from "../src/paper/run.js";
import {
  primaryMarket,
  score,
  takerSetting,
  type ScoreInput,
} from "../src/paper/score.js";
import { DROP_BPS, verdict } from "../src/paper/stats.js";
import { loadSeed } from "../src/paper/seed.js";
import { PaperStore, type StoredRow } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { A, at, freeze, makeWorld } from "./paper-e2e.js";
import {
  EMPTY_RULE_BOOK,
  addr,
  client,
  emptyWorld,
  log,
} from "./paper-world.js";

const kit = await loadResearch();
const scratch = mkdtempSync(path.join(tmpdir(), "paper-guards-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const OPEN = { open: true };
type Request = Parameters<typeof paperRequest>[0];
const fakeClient = (
  get: (route: string, query: Record<string, string>) => unknown,
) =>
  ({
    get: (route: string, query: Record<string, string>) =>
      Promise.resolve(get(route, query)),
  }) as unknown as Request;
const EMPTY_PAGE = { ok: true, data: { data: [], more: false, cursor: null } };
const FAILED = { ok: false, reason: "http_error", status: 503, text: "" };

describe("the frozen numbers and names", () => {
  it("DROP: m + z·SE below +10 bps, the edge exactly", () => {
    expect(DROP_BPS).toBe(10);
    const at10 = (mean: number) =>
      verdict({ mean, se: 1, z: 2.81, meanD: 1, unpricedShare: 0 });
    expect(at10(10 - 2.81 - 1e-9)).toBe("DROP");
    expect(at10(10 - 2.81)).toBe("KEEP");
  });

  it("the freeze covers the program, the research files and the experiment's files: an unlisted file in any is refused", () => {
    expect([...FROZEN_SCOPE]).toEqual([
      "dist/paper.js",
      "dist/paper",
      "research",
      "experiment",
    ]);
    const root = path.join(scratch, "scope");
    for (const f of [
      "dist/paper.js",
      "dist/paper/a.js",
      "research/r.mjs",
      "experiment/rules.md",
    ]) {
      mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
      writeFileSync(path.join(root, f), f);
    }
    const list = [
      "dist/paper.js",
      "dist/paper/a.js",
      "research/r.mjs",
      "experiment/rules.md",
    ]
      .map((f) => `${sha256(f)} *${f}`)
      .join("\n");
    writeFileSync(path.join(root, "experiment/FROZEN.sha256"), `${list}\n`);
    expect(verifyFreeze(root).ok).toBe(true);
    writeFileSync(path.join(root, "research/extra.mjs"), "x");
    writeFileSync(path.join(root, "experiment/extra.txt"), "x");
    expect(verifyFreeze(root)).toEqual({
      ok: false,
      problems: [
        "not in the freeze: research/extra.mjs",
        "not in the freeze: experiment/extra.txt",
      ],
    });
  });

  it("the experiment's lock and heartbeat are its own, never the poller's", () => {
    expect(PAPER_LOCK).toEqual({
      lock: "paper.lock",
      heartbeat: "paper-heartbeat.json",
    });
  });

  it("a run stops at once at 1,000 rejected rows (R3)", () => {
    expect(ALARM_STOP_ROWS).toBe(1_000);
  });

  it("the page holds the newest 500 positions, and calls itself stale after 36 hours (R15)", () => {
    expect(PAGE_ROWS).toBe(500);
    const row = (i: number) => ({
      addr: addr(i),
      symbol: "BTC-USD",
      side: "long" as const,
      t: i,
      tIn: i,
      entryPrice: 1,
      legs: "close",
      state: "closed" as const,
      net: 1,
      flags: [],
    });
    const data: PageData = {
      writtenAt: 0,
      dataThrough: 0,
      frozen: null,
      nextLook: null,
      verdict: null,
      lines: [],
      rows: Array.from({ length: 501 }, (_, i) => row(i)),
      traders: [],
      lacks: [],
      cost: "",
    };
    const page = renderPage(data);
    expect(page.split('<tr><td class="l">0x').length - 1).toBe(500);
    expect(page).toContain("The newest 500 of 501");
    expect(page).toContain("> 36 * 3600 * 1000)");
  });
});

describe("a read's failures (R3)", () => {
  it("takes only a 400 saying 'account not found' as a standing hole, and a dropped request as the pause", async () => {
    const read = (reply: unknown) =>
      readFills(
        paperRequest(
          fakeClient(() => reply),
          OPEN,
        ),
        addr(1),
        CUT,
        CUT + DAY_MS,
        10,
      );
    const http400 = (text: string) => ({
      ok: false,
      reason: "http_error",
      status: 400,
      text,
    });
    expect((await read(http400('{"error":"bad request"}'))).kind).toBe(
      "failed",
    );
    expect(
      (await read(http400('{"status":"err","error":"account not found"}')))
        .kind,
    ).toBe("not found");
    expect((await read({ ok: false, reason: "budget" })).kind).toBe("paused");
  });
});

describe("the loop's breaker, its weeks and its standing holes (R3a)", () => {
  const MON2 = at("2026-11-09T00:00:00Z");
  const input = (
    root: string,
    pool: string[],
    request: Request,
    markets: number[] = [],
  ) => {
    const store = new PaperStore(root);
    return {
      store,
      state: store.readState(),
      run: () =>
        readThrough({
          pool,
          favourites: [],
          markets,
          end: MON2,
          weekList: () => new Set(),
          request: paperRequest(request, OPEN),
          store,
          state: store.readState(),
          log,
          readOn: "2026-11-09",
        }),
    };
  };

  it("counts five failed reads in a row only: a read that succeeds starts the count again", async () => {
    const pool = Array.from({ length: 9 }, (_, i) => addr(i + 1));
    const r = input(
      path.join(scratch, "breaker"),
      pool,
      fakeClient((_route, q) => (q.address === addr(5) ? EMPTY_PAGE : FAILED)),
    );
    const out = await r.run();
    expect(out.end).toBe("done");
    expect(out.counts.failedReads).toBe(8);
  });

  it("reads a week again while one of its market-days is missing", async () => {
    const root = path.join(scratch, "missing-day");
    let fail = true;
    // The synthetic API, but the first run's reads of the cut's day fail.
    const { rest } = client(emptyWorld(), at("2026-11-09T04:00:00Z"));
    const market = {
      get: (route: string, query: Record<string, string>, wait: number) =>
        fail && Number(query.start_timestamp) === CUT
          ? Promise.resolve(FAILED)
          : (
              rest.get as (
                r: string,
                q: Record<string, string>,
                w: number,
              ) => Promise<unknown>
            )(route, query, wait),
    } as unknown as Request;
    const first = await input(root, [], market, [6]).run();
    expect(first.counts.failedMarketDays).toBeGreaterThan(0);
    const present = () => new PaperStore(root).marketDays(6);
    expect(present().has(CUT)).toBe(false);
    fail = false;
    await input(root, [], market, [6]).run();
    expect(present().has(CUT)).toBe(true);
  });

  it("saves a standing hole at once, before any other read", async () => {
    const root = path.join(scratch, "standing");
    const [n, x] = [addr(1), addr(2)];
    const r = input(
      root,
      [n, x],
      fakeClient((_route, q) => {
        if (q.address === n)
          return {
            ok: false,
            reason: "http_error",
            status: 400,
            text: '{"error":"account not found"}',
          };
        throw new Error("the API is gone");
      }),
    );
    await expect(r.run()).rejects.toThrow("the API is gone");
    expect(new PaperStore(root).readState().accounts[n]?.holes).toMatchObject([
      { cause: "account not found" },
    ]);
  });
});

describe("the experiment's backup and its frozen inputs (Q-F, F10)", () => {
  it("copies a file whose content changed at the same size, and the looks", () => {
    const root = path.join(scratch, "backup-root");
    const dest = path.join(scratch, "backup-dest");
    mkdirSync(path.join(root, "looks", "L1"), { recursive: true });
    writeFileSync(path.join(root, "state.json"), "aaaa");
    writeFileSync(path.join(root, "looks", "L1", "result.json"), "{}");
    expect(backupPaper(root, dest)).toBe(2);
    writeFileSync(path.join(root, "state.json"), "bbbb");
    expect(backupPaper(root, dest)).toBe(1);
    expect(readFileSync(path.join(dest, "state.json"), "utf8")).toBe("bbbb");
    expect(existsSync(path.join(dest, "looks", "L1", "result.json"))).toBe(
      true,
    );
  });

  it("loads a pre-cut panel file only when it is the pinned one", () => {
    const dir = path.join(scratch, "panel");
    mkdirSync(dir, { recursive: true });
    const panel = {
      iid: 6,
      symbol: "BTC-USD",
      category: "crypto",
      start: CUT,
      end: CUT,
      firstTrade: null,
      retired: null,
      marks: [],
      klines: { minute: [], trades: [], volume: [] },
      funding: [],
    };
    const bytes = gzipSync(JSON.stringify(panel));
    writeFileSync(path.join(dir, "6.json.gz"), bytes);
    const pinned = new Map([["6.json.gz", sha256(bytes)]]);
    expect(loadPrecut(dir, pinned, 6).iid).toBe(6);
    writeFileSync(
      path.join(dir, "6.json.gz"),
      gzipSync(JSON.stringify({ ...panel, symbol: "X" })),
    );
    expect(() => loadPrecut(dir, pinned, 6)).toThrow(/differs from the pinned/);
  });

  it("refuses a kit whose fingerprint is not the pinned one, even one consistent with its own list", async () => {
    const root = path.join(scratch, "research");
    cpSync(RESEARCH_ROOT, root, { recursive: true });
    const file = path.join(root, "kit", "agreement.mjs");
    writeFileSync(file, `${readFileSync(file, "utf8")}// changed\n`);
    const list = path.join(root, "kit", "FINGERPRINT.sha256");
    writeFileSync(
      list,
      readFileSync(list, "utf8").replace(
        /^[0-9a-f]{64} \*agreement\.mjs$/m,
        `${sha256(readFileSync(file))} *agreement.mjs`,
      ),
    );
    await expect(loadResearch(root)).rejects.toThrow(/is not the pinned/);
  });
});

describe("the day's manifest", () => {
  it("names each file once, with the last hash it had", () => {
    const root = path.join(scratch, "manifest");
    const store = new PaperStore(root);
    store.saveState({ version: 1, accounts: {} });
    store.saveState({
      version: 1,
      accounts: { [addr(1)]: { P: CUT, from: CUT, holes: [] } },
    });
    store.flushManifest("2026-11-10");
    const lines = readFileSync(
      path.join(root, "manifest", "2026-11-10.sha256"),
      "utf8",
    )
      .trim()
      .split("\n");
    expect(lines).toEqual([
      `${sha256(readFileSync(path.join(root, "state.json")))} *state.json`,
    ]);
  });
});

describe("a Monday's facts at their edges (R5)", () => {
  it("takes the fills strictly before M, and the habits' read window as 30 days", () => {
    const fill = (t: number) => ({ t }) as Fill;
    expect(fillsBefore([fill(1), fill(2), fill(3)], 2)).toHaveLength(1);
    const M = at("2026-11-30T00:00:00Z");
    const account = accountData(kit, addr(1), null, [], {
      P: M,
      from: M - 29.5 * DAY_MS,
      holes: [],
    });
    const f = mondayFacts(kit, account, M, new Map());
    expect([f.labelCovered, f.habitCovered]).toEqual([true, false]);
  });
});

describe("the rule book's days at their edges (R6 (3))", () => {
  it("leaves a market out from the very start of its record's day, and of a split day", () => {
    const day1 = at("2026-11-12T00:00:00Z");
    const day2 = at("2026-11-14T00:00:00Z");
    const list = (when: number, closeOnly: boolean) => ({
      kind: "instruments",
      key: "list",
      at: when,
      value: [{ instrument_id: 6, symbol: "BTC-USD", close_only: closeOnly }],
    });
    const book = parseRuleBook(
      [list(day1 + HOUR_MS, false), list(day2 + 5 * HOUR_MS, true)],
      [6],
    );
    const input = (b = book) =>
      ({
        kit,
        kitMarkets: new Map([[6, "crypto"]]),
        book: b,
      }) as unknown as ScoreInput;
    expect(primaryMarket(input(), 6, day2 - 1)).toBe(true);
    expect(primaryMarket(input(), 6, day2)).toBe(false);
    const split = {
      ...book,
      leftOutFrom: new Map(),
      splits: [{ iid: 6, from: day2, to: day2 }],
    };
    expect(primaryMarket(input(split), 6, day2 - 1)).toBe(true);
    expect(primaryMarket(input(split), 6, day2)).toBe(false);
    expect(primaryMarket(input(split), 6, day2 + DAY_MS)).toBe(true);
  });
});

describe("MAIN's lines beside and its entry price, wired as R13 says (R9, R13)", () => {
  it(
    "prices STOP2, STOP5 and DAYS7 from their own instants, J at the trader's fill, the entry price with the spread; and a run saves its Monday cache",
    { timeout: 60_000 },
    async () => {
      const tmp = path.join(scratch, "wiring");
      mkdirSync(tmp, { recursive: true });
      const { pkg, fixed, paperRoot, run } = await makeWorld(tmp);
      freeze(pkg);
      const root = paperRoot("paper");
      expect((await run(root, "2027-01-02T04:00:00Z")).exit).toBe(0);
      expect(loadCache(root).size).toBeGreaterThan(0);
      const store = new PaperStore(root);
      const end = at("2027-01-02T00:00:00Z");
      const state = store.readState();
      // A long position of A, held nine days, so that DAYS7 closes before the trader does.
      const long = (
        t: number,
        side: "long" | "short",
        prev: string,
      ): StoredRow => ({
        trade_id: String(t),
        order_id: String(t),
        instrument_id: 6,
        timestamp: t,
        side,
        price: "100",
        quantity: "1",
        previous_size: prev,
        fee: "0",
        pnl: "0",
        taker: true,
        liquidation: false,
      });
      const tLong = at("2026-12-22T20:00:00Z");
      const base = scoreInput(
        { kit, store, state, book: EMPTY_RULE_BOOK, cache: new Map(), end },
        fixed,
      );
      const input: ScoreInput = {
        ...base,
        account: (a) =>
          a !== A
            ? base.account(a)
            : accountData(
                kit,
                A,
                loadSeed(path.join(root, "seed"), fixed.seedManifest, A),
                [
                  ...store.readRows(A),
                  long(tLong, "long", "0"),
                  long(tLong + 9 * DAY_MS, "short", "1"),
                ],
                state.accounts[A]!,
              ),
      };
      const scored = score(input);
      const setting = takerSetting(input);
      const main = scored.copies.filter(
        (c) => c.lines.includes("MAIN") && c.money !== null,
      );
      expect(main.some((c) => c.t === tLong)).toBe(true);
      expect(mondayOf(tLong)).toBe(at("2026-12-21T00:00:00Z"));
      let differ = 0;
      for (const c of main) {
        const mk = input.market(c.iid)!;
        const price = (legs: ReturnType<typeof planCopyThrough>["legs"]) => {
          const p = kit.exits.priceCopy(mk, {
            dir: c.dir,
            tIn: c.tIn,
            legs,
            setting,
          });
          return p.reason === undefined ? p.net * 1e4 : null;
        };
        const variant = (closeAt: number | null) =>
          closeAt === null
            ? c.money!.net
            : price(
                planCopyThrough({ t: c.t, D: c.D }, c.exits, end, closeAt).legs,
              );
        const until = c.plan.flag === null ? c.plan.lastExitT! + c.D : end;
        expect(c.stop2).toBe(variant(stopInstant(kit, mk, c, 0.02, until)));
        expect(c.stop5).toBe(variant(stopInstant(kit, mk, c, 0.05, until)));
        expect(c.days7).toBe(variant(c.tIn + DAYS7_MS));
        expect(c.jump).toBe(jumpRatio(kit, mk, c.t));
        expect(c.entryPrice).toBe(
          kit.panel.markAtMinuteEnd(mk, c.tIn)! *
            (1 + c.dir * setting.spread(c.iid, c.tIn).c),
        );
        if (c.stop2 !== c.money!.net || c.days7 !== c.money!.net) differ += 1;
      }
      expect(DAYS7_MS).toBe(7 * DAY_MS);
      expect(main.find((c) => c.t === tLong)!.days7).not.toBe(
        main.find((c) => c.t === tLong)!.money!.net,
      );
      expect(differ).toBeGreaterThan(0);
    },
  );
});
