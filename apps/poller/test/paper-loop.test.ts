import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { spentInWindow, type Spend } from "../src/api/admission.js";
import { CUT } from "../src/paper/instants.js";
import { readThrough, type LoopInput } from "../src/paper/loop.js";
import { paperRequest } from "../src/paper/reader.js";
import { PAPER_LOCK, openRun } from "../src/paper/run.js";
import { PaperStore } from "../src/paper/store.js";
import { DAY_MS } from "../src/schedule.js";
import {
  addr,
  client,
  emptyWorld,
  log,
  row,
  type Call,
  type World,
} from "./paper-world.js";

const scratch = mkdtempSync(path.join(tmpdir(), "paper-loop-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
const OPEN = { open: true };
const MON2 = Date.parse("2026-11-09T00:00:00Z");
const MON3 = Date.parse("2026-11-16T00:00:00Z");
const MARKETS = [6, 7];

function run(
  world: World,
  root: string,
  startWall: number,
  end: number,
  over: Partial<LoopInput> = {},
) {
  const c = client(world, startWall);
  const store = new PaperStore(root);
  const state = store.readState();
  const input: LoopInput = {
    pool: [],
    favourites: [],
    markets: MARKETS,
    end,
    weekList: () => new Set(),
    request: paperRequest(c.rest, OPEN),
    store,
    state,
    log,
    readOn: new Date(startWall).toISOString().slice(0, 10),
    ...over,
  };
  return {
    done: readThrough(input),
    calls: c.calls,
    store,
    state,
    rest: c.rest,
  };
}

/** Each call's weight as the experiment's route table charges it. */
const weightOf = (call: Call) =>
  call.url.pathname === "/v1/info/fills" ||
  call.url.pathname === "/v1/info/funding"
    ? 10
    : 5;

function peaks(calls: readonly Call[]) {
  const spends: Spend[] = [];
  let minute = 0;
  let burst = 0;
  for (const call of calls) {
    spends.push({ at: call.at, weight: weightOf(call) });
    minute = Math.max(minute, spentInWindow(spends, call.at, 60_000));
    burst = Math.max(burst, spentInWindow(spends, call.at, 5_000));
  }
  return { minute, burst };
}

describe("the reading loop: one rule for the first run, a missed day and Mondays (F1, F11)", () => {
  // 600 pool accounts, mostly idle; two on every week's list; one busy past
  // the sweep's cap; one the API does not know.
  const world = emptyWorld();
  const pool = Array.from({ length: 600 }, (_, i) => addr(i + 1));
  const list = new Set([addr(1), addr(2)]);
  world.fills.set(
    addr(1),
    Array.from({ length: 150 }, (_, i) => row(i, CUT + i * 3_600_000)),
  );
  world.fills.set(addr(2), [row(1, CUT + 1_000, { trade_id: "BIG" })]);
  world.literals.set("BIG", "9007199254740993");
  world.fills.set(
    addr(3),
    Array.from({ length: 2_500 }, (_, i) => row(i, CUT + i * 60_000)),
  );
  world.notFound.add(addr(4));
  const root = path.join(scratch, "monday");
  const weekList = () => list;

  // Each state save is flushed to disk, so a busy disk slows this test (PAPER-FIX-CHECK N2).
  it(
    "pauses at the night window, sends nothing in it, and the next start finishes the week from each P",
    { timeout: 30_000 },
    async () => {
      const first = run(world, root, Date.parse("2026-11-16T02:00:00Z"), MON3, {
        pool,
        weekList,
      });
      const one = await first.done;
      expect(one.end).toBe("paused");
      const pauseFrom = Date.parse("2026-11-16T02:34:45Z");
      const pauseTo = Date.parse("2026-11-16T03:50:00Z");
      expect(first.calls.every((c) => c.wall < pauseFrom)).toBe(true);
      expect(first.calls.at(-1)!.wall).toBeGreaterThan(pauseFrom - 10_000);
      const readBefore = Object.values(first.state.accounts).filter(
        (a) => a.P === MON2,
      ).length;
      expect(readBefore).toBeGreaterThan(100);
      expect(readBefore).toBeLessThan(600);

      const second = run(world, root, pauseTo, MON3, { pool, weekList });
      const two = await second.done;
      expect(two.end).toBe("done");
      expect(second.calls.every((c) => c.wall >= pauseTo)).toBe(true);
      for (const calls of [first.calls, second.calls]) {
        expect(peaks(calls).minute).toBeLessThanOrEqual(120);
        expect(peaks(calls).burst).toBeLessThanOrEqual(15);
      }
      expect(second.rest.counts.dropped).toBe(0);

      // Every account read to the Monday, but the one the API does not know.
      const state = second.store.readState();
      for (const a of pool) {
        if (a === addr(4)) continue;
        expect([a, state.accounts[a]!.P]).toEqual([a, MON3]);
      }
      expect(state.accounts[addr(4)]!.holes).toMatchObject([
        { from: CUT, cause: "account not found" },
      ]);
      // The busy account: 10 pages in its first account-week, then a hole to its Monday.
      expect(state.accounts[addr(3)]!.holes).toEqual([
        {
          from: CUT + 999 * 60_000,
          to: MON2,
          cause: "page cap",
          readOn: "2026-11-16",
        },
      ]);
      expect(second.store.readRows(addr(3))).toHaveLength(1_000);
      // The list accounts uncapped; the big id exactly.
      expect(second.store.readRows(addr(1))).toHaveLength(150);
      expect(second.store.readRows(addr(2))[0]!.trade_id).toBe(
        "9007199254740993",
      );
      // Every market-day from the cut to the Monday.
      for (const iid of MARKETS) {
        expect(second.store.marketDays(iid).size).toBe(9);
        const day = second.store.readMarketDay(iid, MON2);
        expect(day.marks.filter((m) => m !== null)).toHaveLength(1_440);
        expect(day.funding).toHaveLength(24);
      }
    },
  );

  it("on the next day reads only the week's list and that day's markets, and asks no finished week for its list", async () => {
    const asked: number[] = [];
    const next = run(
      world,
      root,
      MON3 + DAY_MS + 4 * 3_600_000,
      MON3 + DAY_MS,
      {
        pool,
        weekList: (monday) => {
          asked.push(monday);
          return list;
        },
      },
    );
    expect((await next.done).end).toBe("done");
    expect(asked).toEqual([MON3]);
    const paths = next.calls.map(
      (c) =>
        `${c.url.pathname} ${c.url.searchParams.get("address") ?? c.url.searchParams.get("instrument_id")}`,
    );
    expect(paths).toEqual([
      `/v1/info/fills ${addr(1)}`,
      `/v1/info/fills ${addr(2)}`,
      "/v1/info/mark-history 6",
      "/v1/info/mark-history 6",
      "/v1/info/klines 6",
      "/v1/info/funding 6",
      "/v1/info/mark-history 7",
      "/v1/info/mark-history 7",
      "/v1/info/klines 7",
      "/v1/info/funding 7",
    ]);
    expect(next.store.readState().accounts[addr(1)]!.P).toBe(MON3 + DAY_MS);
    expect(next.store.readState().accounts[addr(5)]!.P).toBe(MON3);
  });
});

describe("the list's safety cap and the schema alarm (F3, F11)", () => {
  it("holes a list account past 50 pages a day, and names it", async () => {
    const world = emptyWorld();
    world.fills.set(
      addr(1),
      Array.from({ length: 5_200 }, (_, i) => row(i, MON2 + i * 10_000)),
    );
    const r = run(
      world,
      path.join(scratch, "safety"),
      MON2 + 30 * 3_600_000,
      MON2 + DAY_MS,
      {
        pool: [addr(1)],
        markets: [],
        weekList: () => new Set([addr(1)]),
      },
    );
    const out = await r.done;
    expect(out.counts.safetyCapped).toEqual([addr(1)]);
    expect(r.state.accounts[addr(1)]!.holes).toEqual([
      {
        from: MON2 + 4_999 * 10_000,
        to: MON2 + DAY_MS,
        cause: "safety cap",
        readOn: "2026-11-10",
      },
    ]);
  });

  it("writes no hole and moves no P for the reads with rejected rows when over 1% of the run's rows fail", async () => {
    const world = emptyWorld();
    world.fills.set(
      addr(1),
      Array.from({ length: 100 }, (_, i) =>
        row(i, MON2 + i * 1_000, i < 15 ? { side: "?" } : {}),
      ),
    );
    world.fills.set(addr(2), [row(1, MON2 + 5)]);
    const root = path.join(scratch, "alarm");
    const r = run(world, root, MON2 + 30 * 3_600_000, MON2 + DAY_MS, {
      pool: [addr(1), addr(2)],
      markets: [],
      weekList: () => new Set([addr(1), addr(2)]),
    });
    const out = await r.done;
    expect(out.end).toBe("schema alarm");
    expect(out.counts).toMatchObject({ rows: 101, rejectedRows: 15 });
    const state = r.store.readState();
    // Its clean first week stands; the week with the rejected rows is read again next time.
    expect(state.accounts[addr(1)]).toEqual({ P: MON2, from: CUT, holes: [] });
    expect(r.store.readRows(addr(1))).toEqual([]);
    // A read with no rejected row is kept.
    expect(state.accounts[addr(2)]!.P).toBe(MON2 + DAY_MS);
  });

  it("keeps a rejected row's account-day as a hole when the run stays under the alarm, and reads that account no further in the run", async () => {
    const world = emptyWorld();
    world.fills.set(
      addr(1),
      Array.from({ length: 2_000 }, (_, i) =>
        row(i, MON2 + i * 1_000, i === 7 ? { side: "?" } : {}),
      ),
    );
    const r = run(
      world,
      path.join(scratch, "one-bad"),
      MON3 + DAY_MS + 4 * 3_600_000,
      MON3 + DAY_MS,
      {
        pool: [addr(1)],
        markets: [],
        weekList: () => new Set([addr(1)]),
      },
    );
    const out = await r.done;
    expect(out.end).toBe("done");
    expect(r.store.readState().accounts[addr(1)]).toEqual({
      P: MON3,
      from: CUT,
      holes: [
        {
          from: MON2,
          to: MON2 + DAY_MS,
          cause: "rejected rows",
          readOn: "2026-11-17",
          rows: 1,
        },
      ],
    });
    expect(r.store.readRows(addr(1))).toHaveLength(1_999);
    const starts = r.calls.map((c) =>
      Number(c.url.searchParams.get("start_timestamp")),
    );
    expect(starts.filter((s) => s === MON2)).toHaveLength(20);
    expect(starts.filter((s) => s === MON3)).toHaveLength(0);
  });

  it("ends the run after five failed reads in a row, moving no P", async () => {
    const failing = {
      get: () =>
        Promise.resolve({
          ok: false as const,
          reason: "http_error" as const,
          status: 503,
          text: "",
        }),
    } as unknown as Parameters<typeof paperRequest>[0];
    let tries = 0;
    const counted = {
      get: (...args: Parameters<typeof failing.get>) => {
        tries += 1;
        return failing.get(...args);
      },
    } as unknown as Parameters<typeof paperRequest>[0];
    const pool = Array.from({ length: 10 }, (_, i) => addr(i + 1));
    const r = run(
      emptyWorld(),
      path.join(scratch, "failing"),
      MON2 + 4 * 3_600_000,
      MON2,
      {
        pool,
        markets: [],
        request: paperRequest(counted, OPEN),
      },
    );
    const out = await r.done;
    expect(out.end).toBe("api failing");
    expect(out.counts.failedReads).toBe(5);
    expect(tries).toBe(15);
    expect(Object.values(r.state.accounts).every((a) => a.P === CUT)).toBe(
      true,
    );
  });

  it("ends at the night pause at the first read it meets, whatever is left", async () => {
    const pool = [addr(1), addr(2), addr(3)];
    const r = run(
      emptyWorld(),
      path.join(scratch, "pause"),
      Date.parse("2026-11-16T03:00:00Z"),
      MON3,
      {
        pool,
        markets: [],
      },
    );
    const out = await r.done;
    expect(out.end).toBe("paused");
    expect(r.calls).toHaveLength(0);
    expect(out.counts.accountReads).toBe(0);
  });
});

describe("the favourites (arm F)", () => {
  it("are read every day from their own start, never in the sweep", async () => {
    const world = emptyWorld();
    world.fills.set(addr(9), [row(1, MON2 + 1_000)]);
    const r = run(
      world,
      path.join(scratch, "favourite"),
      MON3 + 4 * 3_600_000,
      MON3,
      {
        pool: [addr(1)],
        favourites: [{ addr: addr(9), from: MON2 }],
        markets: [],
      },
    );
    expect((await r.done).end).toBe("done");
    expect(r.store.readState().accounts[addr(9)]).toEqual({
      P: MON3,
      from: MON2,
      holes: [],
    });
    expect(r.store.readRows(addr(9))).toHaveLength(1);
    const asked = r.calls
      .filter((c) => c.url.searchParams.get("address") === addr(9))
      .map((c) => Number(c.url.searchParams.get("start_timestamp")));
    expect(asked).toEqual([MON2]);
  });
});

describe("the run's mechanics (F11)", () => {
  it("has its own log and lock: a second run is refused while the first's heartbeat is fresh", () => {
    const stateDir = path.join(scratch, "var");
    const first = openRun(stateDir);
    expect(first.taken).toBe(true);
    expect(readdirSync(path.join(stateDir, "logs"))[0]).toMatch(
      /^paper-\d{4}-\d{2}-\d{2}\.log$/,
    );
    expect(existsSync(path.join(stateDir, PAPER_LOCK.heartbeat))).toBe(true);
    if (first.taken) first.stage("reading");
    expect(
      JSON.parse(
        readFileSync(path.join(stateDir, PAPER_LOCK.heartbeat), "utf8"),
      ),
    ).toMatchObject({
      pid: process.pid,
      stage: "reading",
    });
    first.close();
    expect(existsSync(path.join(stateDir, PAPER_LOCK.lock))).toBe(false);

    // Another live process named in the lock, with a fresh heartbeat.
    writeFileSync(path.join(stateDir, PAPER_LOCK.lock), `${process.ppid}\n`);
    writeFileSync(path.join(stateDir, PAPER_LOCK.heartbeat), "{}");
    const second = openRun(stateDir);
    expect(second).toMatchObject({ taken: false, holderPid: process.ppid });
    second.close();
    // The poller's own lock is a different file.
    expect(existsSync(path.join(stateDir, "poller.lock"))).toBe(false);
  });
});
