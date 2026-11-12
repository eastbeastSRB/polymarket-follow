import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { brotliCompressSync } from "node:zlib";
import { afterAll, describe, expect, it } from "vitest";
import type { Outcome, RestClient } from "../src/api/rest-client.js";
import { covered } from "../src/paper/coverage.js";
import {
  BlindGateError,
  CLOSED,
  checkWindow,
  verifyFreeze,
} from "../src/paper/gate.js";
import { CUT, LOOK_ENDS, mondayOf, runEnd } from "../src/paper/instants.js";
import { rejectedHoles } from "../src/paper/loop.js";
import { paperRequest, readFills, readMarketDay } from "../src/paper/reader.js";
import { reparseHoles } from "../src/paper/reparse.js";
import { loadResearch } from "../src/paper/research.js";
import {
  FillRow,
  parseFillRows,
  type PaperRoutes,
} from "../src/paper/routes.js";
import { FOREVER, PaperStore, type AccountState } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { addr, client, emptyWorld, row } from "./paper-world.js";

const scratch = mkdtempSync(path.join(tmpdir(), "paper-read-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
const OPEN = { open: true };

/** A client whose every reply is what `answer` gives for its route. */
function fake(
  answer: (route: string) => Outcome<unknown>,
): Pick<RestClient<PaperRoutes>, "get"> {
  return {
    get: (route: string) => Promise.resolve(answer(route)),
  } as unknown as Pick<RestClient<PaperRoutes>, "get">;
}
const DAY1 = CUT + 3 * DAY_MS;

describe("the experiment's instants", () => {
  it("are the kit's cut, Mondays and UTC days", async () => {
    const kit = await loadResearch();
    expect(CUT).toBe(kit.constants.CUT);
    expect(new Date(mondayOf(CUT)).toISOString()).toBe(
      "2026-11-02T00:00:00.000Z",
    );
    expect(mondayOf(Date.parse("2026-11-09T00:00:00Z"))).toBe(
      Date.parse("2026-11-09T00:00:00Z"),
    );
    expect(mondayOf(Date.parse("2026-11-08T23:59:59.999Z"))).toBe(
      Date.parse("2026-11-02T00:00:00Z"),
    );
    expect(kit.labels.mondays(CUT - 14 * DAY_MS, CUT)).toEqual([
      Date.parse("2026-10-26T00:00:00Z"),
      Date.parse("2026-11-02T00:00:00Z"),
    ]);
    expect(runEnd(Date.parse("2026-11-30T04:00:00Z"))).toBe(
      Date.parse("2026-11-30T00:00:00Z"),
    );
    expect(LOOK_ENDS.map((t) => new Date(t).getUTCDay())).toEqual([6, 6, 6]);
  });
});

describe("the blind gate (F6)", () => {
  it("refuses a window that reaches the cut while closed, and allows one that ends at it", () => {
    expect(() => checkWindow(CLOSED, CUT - DAY_MS, CUT + 1, "fills")).toThrow(
      BlindGateError,
    );
    expect(() => checkWindow(CLOSED, CUT, CUT + DAY_MS, "fills")).toThrow(
      /reaches the cut, and no valid freeze exists/,
    );
    expect(() => checkWindow(CLOSED, CUT - DAY_MS, CUT, "fills")).not.toThrow();
    expect(() => checkWindow(OPEN, CUT, CUT + DAY_MS, "fills")).not.toThrow();
    expect(() => checkWindow(OPEN, CUT, CUT, "fills")).toThrow(/empty window/);
  });

  it("sends nothing for a refused window", async () => {
    const world = emptyWorld();
    const c = client(world, DAY1);
    const request = paperRequest(c.rest, CLOSED);
    await expect(
      readFills(request, addr(1), CUT, CUT + DAY_MS, 10),
    ).rejects.toThrow(BlindGateError);
    await expect(readMarketDay(request, 6, CUT)).rejects.toThrow(
      BlindGateError,
    );
    expect(c.calls).toHaveLength(0);
    // A window before the cut is read.
    await readFills(request, addr(1), CUT - DAY_MS, CUT, 10);
    expect(c.calls).toHaveLength(1);
  });

  it("opens only on a freeze that lists every file of what runs, each with its hash", () => {
    const root = path.join(scratch, "pkg");
    const files: Record<string, string> = {
      "dist/paper.js": "main",
      "dist/paper/a.js": "a",
      "research/kit/x.mjs": "x",
      "experiment/rules.md": "rules",
    };
    for (const [f, text] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
      writeFileSync(path.join(root, f), text);
    }
    expect(verifyFreeze(root)).toEqual({
      ok: false,
      problems: ["no experiment/FROZEN.sha256"],
    });
    const sha = (text: string) =>
      createHash("sha256").update(text).digest("hex");
    const list = (names: string[]) =>
      names.map((f) => `${sha(files[f]!)} *${f}`).join("\n") + "\n";
    const all = Object.keys(files);
    writeFileSync(path.join(root, "experiment/FROZEN.sha256"), list(all));
    const ok = verifyFreeze(root);
    expect(ok).toMatchObject({ ok: true, files: 4 });
    // A draft beside it is not part of what it hashes.
    writeFileSync(path.join(root, "experiment/FROZEN.draft.sha256"), "draft");
    expect(verifyFreeze(root).ok).toBe(true);
    // A file of what runs left out of the list.
    writeFileSync(
      path.join(root, "experiment/FROZEN.sha256"),
      list(all.slice(1)),
    );
    expect(verifyFreeze(root)).toEqual({
      ok: false,
      problems: ["not in the freeze: dist/paper.js"],
    });
    // A changed byte.
    writeFileSync(path.join(root, "experiment/FROZEN.sha256"), list(all));
    writeFileSync(path.join(root, "research/kit/x.mjs"), "y");
    expect(verifyFreeze(root)).toEqual({
      ok: false,
      problems: ["changed: research/kit/x.mjs"],
    });
    // An extra file in a frozen folder.
    writeFileSync(path.join(root, "research/kit/x.mjs"), "x");
    writeFileSync(path.join(root, "dist/paper/b.js"), "b");
    expect(verifyFreeze(root)).toEqual({
      ok: false,
      problems: ["not in the freeze: dist/paper/b.js"],
    });
  });
});

describe("a fill row's check (R3)", () => {
  it("keeps ids as digits and drops a row the kit's validFill would drop", async () => {
    const kit = await loadResearch();
    const good = {
      ...row(2, DAY1),
      trade_id: "9007199254740993",
      order_id: "5",
    };
    const { fills, rejected } = parseFillRows(
      [
        good,
        { ...good, side: "flat" },
        { ...good, price: "" },
        { ...good, total_fee: null },
        { ...good, taker: "yes" },
        { ...good, trade_id: "1e3" },
        { ...good, timestamp: 1.5 },
        "not a row",
      ],
      kit.fills.normFill,
    );
    expect(fills).toEqual([
      {
        t: DAY1,
        iid: 6,
        oid: "5",
        tid: "9007199254740993",
        prevS: "0",
        prev: 0,
        sgn: 1,
        px: 100.5,
        q: 0.25,
        fee: 0.01,
        pnl: 0,
        taker: true,
        liq: false,
        forced: false,
      },
    ]);
    expect(rejected).toEqual([
      { t: DAY1 },
      { t: DAY1 },
      { t: DAY1 },
      { t: DAY1 },
      { t: DAY1 },
      { t: null },
      { t: null },
    ]);
    // A row the kit accepts with numeric ids passes here with the same digits.
    const numeric = row(2, DAY1);
    expect(kit.fills.validFill(numeric)).toBe(true);
    expect(
      FillRow.safeParse({
        ...numeric,
        trade_id: "1000002",
        order_id: "2000002",
      }).success,
    ).toBe(true);
  });
});

describe("one account's read (R3)", () => {
  it("asks [start, end) oldest first, follows the cursor, and keeps a big id exactly", async () => {
    const world = emptyWorld();
    const rows = Array.from({ length: 250 }, (_, i) =>
      row(i, DAY1 + i * 1_000),
    );
    rows[7] = { ...rows[7]!, trade_id: "BIG" };
    world.literals.set("BIG", "9007199254740993");
    world.fills.set(addr(1), [
      row(999, DAY1 - 1),
      ...rows,
      row(998, DAY1 + DAY_MS),
    ]);
    const c = client(world, DAY1 + 2 * DAY_MS);
    const read = await readFills(
      paperRequest(c.rest, OPEN),
      addr(1),
      DAY1,
      DAY1 + DAY_MS,
      10,
    );
    expect(read).toMatchObject({
      kind: "complete",
      pages: 3,
      rowsSeen: 250,
      rejected: [],
    });
    if (read.kind !== "complete") return;
    expect(read.rows).toHaveLength(250);
    expect(read.rows[7]!.trade_id).toBe("9007199254740993");
    expect(read.rows[8]!.trade_id).toBe("1000008");
    expect(read.lastT).toBe(DAY1 + 249_000);
    const queries = c.calls.map((x) => Object.fromEntries(x.url.searchParams));
    expect(queries[0]).toEqual({
      address: addr(1),
      start_timestamp: String(DAY1),
      end_timestamp: String(DAY1 + DAY_MS),
      sort: "asc",
    });
    expect(queries.map((q) => q.cursor)).toEqual([undefined, "c100", "c200"]);
  });

  it("stops at its page cap, and says where the read ended", async () => {
    const world = emptyWorld();
    world.fills.set(
      addr(2),
      Array.from({ length: 450 }, (_, i) => row(i, DAY1 + i * 1_000)),
    );
    const c = client(world, DAY1 + 2 * DAY_MS);
    const read = await readFills(
      paperRequest(c.rest, OPEN),
      addr(2),
      DAY1,
      DAY1 + DAY_MS,
      2,
    );
    expect(read).toMatchObject({
      kind: "capped",
      pages: 2,
      lastT: DAY1 + 199_000,
    });
    expect(c.calls).toHaveLength(2);
  });

  it("counts a rejected row and a row outside its window, with their instants", async () => {
    const world = emptyWorld();
    world.fills.set(addr(3), [
      row(1, DAY1),
      row(2, DAY1 + 5, { side: "?" }),
      row(3, DAY1 + 6, { price: null }),
      row(4, DAY1 + 7),
    ]);
    const c = client(world, DAY1 + 2 * DAY_MS);
    const read = await readFills(
      paperRequest(c.rest, OPEN),
      addr(3),
      DAY1,
      DAY1 + DAY_MS,
      10,
    );
    expect(read).toMatchObject({
      kind: "complete",
      rowsSeen: 4,
      rejected: [{ t: DAY1 + 5 }, { t: DAY1 + 6 }],
    });
    // A reply that breaks [start, end): its rows outside are refused and counted.
    const outside = await readFills(
      paperRequest(
        fake(() => ({
          ok: true,
          data: {
            // As the reviver leaves them: ids as text.
            data: [row(1, DAY1 - 1), row(2, DAY1), row(3, DAY1 + DAY_MS)].map(
              (r) => ({
                ...r,
                trade_id: String(r.trade_id),
                order_id: String(r.order_id),
              }),
            ),
            more: false,
            cursor: null,
          },
          recvMs: 0,
          served: { date: null, age: null },
        })),
        OPEN,
      ),
      addr(3),
      DAY1,
      DAY1 + DAY_MS,
      10,
    );
    expect(outside).toMatchObject({
      kind: "complete",
      rowsSeen: 3,
      rejected: [{ t: DAY1 - 1 }, { t: DAY1 + DAY_MS }],
    });
    if (outside.kind === "complete") expect(outside.rows).toHaveLength(1);
  });

  it("fails a read whose page says more without a cursor", async () => {
    const read = await readFills(
      paperRequest(
        fake(() => ({
          ok: true,
          data: { data: [], more: true, cursor: null },
          recvMs: 0,
          served: { date: null, age: null },
        })),
        OPEN,
      ),
      addr(3),
      DAY1,
      DAY1 + DAY_MS,
      10,
    );
    expect(read).toEqual({ kind: "failed", reason: "no cursor", pages: 1 });
  });

  it("names an account the API does not know, and a read that failed", async () => {
    const world = emptyWorld();
    world.notFound.add(addr(4));
    const c = client(world, DAY1 + 2 * DAY_MS);
    const request = paperRequest(c.rest, OPEN);
    expect(await readFills(request, addr(4), DAY1, DAY1 + DAY_MS, 10)).toEqual({
      kind: "not found",
      pages: 0,
    });
    // Three tries of an HTTP error, spaced by the client's back-off.
    expect(c.calls).toHaveLength(3);
    const failing = paperRequest(
      fake(() => ({ ok: false, reason: "timeout" })),
      OPEN,
    );
    expect(await readFills(failing, addr(5), DAY1, DAY1 + DAY_MS, 10)).toEqual({
      kind: "failed",
      reason: "timeout",
      pages: 0,
    });
  });

  it("ends at the night pause without sending", async () => {
    const world = emptyWorld();
    const c = client(world, Date.parse("2026-11-12T02:40:00Z"));
    const read = await readFills(
      paperRequest(c.rest, OPEN),
      addr(1),
      DAY1,
      DAY1 + DAY_MS,
      10,
    );
    expect(read).toEqual({ kind: "paused", pages: 0 });
    expect(c.calls).toHaveLength(0);
  });
});

describe("one market-day (R9)", () => {
  it("builds 1,440 marks, the populated klines and the funding by nominal hour", async () => {
    const world = emptyWorld();
    // Minutes 10-12 hold no mark.
    world.minutes = (_iid, from, to) => {
      const out: number[] = [];
      for (let t = from; t < to; t += MINUTE_MS) {
        const i = (t - DAY1) / MINUTE_MS;
        if (i < 10 || i > 12) out.push(t);
      }
      return out;
    };
    const c = client(world, DAY1 + 2 * DAY_MS);
    const read = await readMarketDay(paperRequest(c.rest, OPEN), 6, DAY1);
    expect(read.kind).toBe("ok");
    if (read.kind !== "ok") return;
    const { day } = read;
    expect(day.marks).toHaveLength(1_440);
    expect(day.marks.slice(9, 14)).toEqual([
      100 + ((DAY1 / MINUTE_MS + 9) % 7),
      null,
      null,
      null,
      100 + ((DAY1 / MINUTE_MS + 13) % 7),
    ]);
    expect(day.klines.minute.slice(0, 3)).toEqual(
      [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(
        (i) => (DAY1 / MINUTE_MS + i) % 3 === 0,
      ),
    );
    expect(day.klines.trades.every((n) => n === 4)).toBe(true);
    expect(day.klines.volume.every((v) => v === 0.125)).toBe(true);
    expect(day.funding).toHaveLength(24);
    expect(day.funding[0]).toEqual([DAY1, 0.0000125, DAY1 + 50]);
    expect(day.funding[23]![0]).toBe(DAY1 + 23 * HOUR_MS);
    const asked = c.calls.map(
      (x) => `${x.url.pathname}?${x.url.searchParams.toString()}`,
    );
    expect(asked).toEqual([
      `/v1/info/mark-history?instrument_id=6&interval=1m&start_timestamp=${DAY1}&end_timestamp=${DAY1 + DAY_MS}`,
      // 1,437 marks: a second page from the minute after the first page's last.
      `/v1/info/mark-history?instrument_id=6&interval=1m&start_timestamp=${DAY1 + 1_003 * MINUTE_MS}&end_timestamp=${DAY1 + DAY_MS}`,
      `/v1/info/klines?instrument_id=6&interval=1m&start_timestamp=${DAY1}&end_timestamp=${DAY1 + DAY_MS - 1}`,
      `/v1/info/funding?instrument_id=6&start_timestamp=${DAY1}&end_timestamp=${DAY1 + DAY_MS - 1}`,
    ]);
  });

  it("files a settlement stamped late under its nominal hour, and fails a day whose reply breaks its shape", async () => {
    const late = (stamp: number) =>
      fake((route) => ({
        ok: true,
        data: {
          data:
            route === "funding"
              ? [{ funding_rate: "-0.5", timestamp: stamp }]
              : [],
          more: false,
        },
        recvMs: 0,
        served: { date: null, age: null },
      }));
    const ok = await readMarketDay(
      paperRequest(late(DAY1 + 20 * HOUR_MS + 46_000), OPEN),
      6,
      DAY1,
    );
    expect(ok).toMatchObject({
      kind: "ok",
      day: {
        funding: [[DAY1 + 20 * HOUR_MS, -0.5, DAY1 + 20 * HOUR_MS + 46_000]],
      },
    });
    // Its own hour however late in it: the hour it was stamped in.
    const later = await readMarketDay(
      paperRequest(late(DAY1 + 20 * HOUR_MS + 45 * MINUTE_MS), OPEN),
      6,
      DAY1,
    );
    expect(later).toMatchObject({
      kind: "ok",
      day: {
        funding: [
          [DAY1 + 20 * HOUR_MS, -0.5, DAY1 + 20 * HOUR_MS + 45 * MINUTE_MS],
        ],
      },
    });
    const outside = await readMarketDay(
      paperRequest(late(DAY1 + DAY_MS + 50), OPEN),
      6,
      DAY1,
    );
    expect(outside).toEqual({
      kind: "failed",
      reason: "a settlement stamped outside the day",
    });
  });

  it("fails a day with two marks, two klines or two settlements in one slot, or a mark that is no minute of it", async () => {
    const replies = (over: Record<string, unknown[]>) =>
      fake((route) => ({
        ok: true,
        data: { data: over[route] ?? [], more: false },
        recvMs: 0,
        served: { date: null, age: null },
      }));
    const kline = (t: number) => [t, "1", "1", "1", "1", "1", 1];
    const cases: [Record<string, unknown[]>, string][] = [
      [
        {
          "mark-history": [
            [DAY1, "1"],
            [DAY1, "2"],
          ],
        },
        "two marks in one minute",
      ],
      [{ "mark-history": [[DAY1 + 30_000, "1"]] }, "no minute of the day"],
      [{ "mark-history": [[DAY1 - MINUTE_MS, "1"]] }, "no minute of the day"],
      [{ klines: [kline(DAY1), kline(DAY1)] }, "two klines in one minute"],
      [{ klines: [kline(DAY1 + DAY_MS)] }, "no minute of the day"],
      [
        {
          funding: [
            { funding_rate: "0", timestamp: DAY1 + 60 },
            { funding_rate: "0", timestamp: DAY1 + 50 },
          ],
        },
        "two settlements in one hour",
      ],
    ];
    for (const [over, reason] of cases) {
      const read = await readMarketDay(
        paperRequest(replies(over), OPEN),
        6,
        DAY1,
      );
      expect(read.kind).toBe("failed");
      if (read.kind === "failed") expect(read.reason).toContain(reason);
    }
  });
});

describe("holes and coverage (R3, F2)", () => {
  it("makes one hole an account-day for rejected rows, and the read's window for a row without an instant", () => {
    expect(
      rejectedHoles(
        [
          { t: DAY1 + 5 },
          { t: DAY1 + 9 },
          { t: DAY1 + DAY_MS + 1 },
          { t: null },
        ],
        DAY1 + 2,
        DAY1 + 2 * DAY_MS - 3,
        "2026-11-12",
      ),
    ).toEqual([
      {
        from: DAY1 + 2,
        to: DAY1 + 2 * DAY_MS - 3,
        cause: "rejected rows",
        readOn: "2026-11-12",
        rows: 1,
      },
      {
        from: DAY1 + 2,
        to: DAY1 + DAY_MS,
        cause: "rejected rows",
        readOn: "2026-11-12",
        rows: 2,
      },
      {
        from: DAY1 + DAY_MS,
        to: DAY1 + 2 * DAY_MS - 3,
        cause: "rejected rows",
        readOn: "2026-11-12",
        rows: 1,
      },
    ]);
  });

  it("counts a window covered only when P reaches its end, no hole meets it, and the seed holds what lies before the reads", () => {
    const account: AccountState = {
      P: CUT + 10 * DAY_MS,
      from: CUT,
      holes: [
        {
          from: CUT + 2 * DAY_MS,
          to: CUT + 3 * DAY_MS,
          cause: "page cap",
          readOn: "2026-11-20",
        },
      ],
    };
    const whole = { truncated: false, oldest: CUT - 90 * DAY_MS };
    const cut = { truncated: true, oldest: CUT - 20 * DAY_MS };
    expect(covered(account, whole, CUT + 3 * DAY_MS, CUT + 10 * DAY_MS)).toBe(
      true,
    );
    expect(
      covered(account, whole, CUT + 3 * DAY_MS, CUT + 10 * DAY_MS + 1),
    ).toBe(false);
    expect(
      covered(account, whole, CUT + 2 * DAY_MS - 1, CUT + 3 * DAY_MS),
    ).toBe(false);
    expect(covered(account, whole, CUT + 3 * DAY_MS, CUT + 4 * DAY_MS)).toBe(
      true,
    );
    expect(covered(account, whole, CUT - 30 * DAY_MS, CUT + DAY_MS)).toBe(true);
    expect(covered(account, cut, CUT - 30 * DAY_MS, CUT + DAY_MS)).toBe(false);
    expect(covered(account, cut, CUT - 20 * DAY_MS, CUT + DAY_MS)).toBe(true);
    expect(covered(account, null, CUT - 1, CUT + DAY_MS)).toBe(false);
    const gone: AccountState = {
      ...account,
      holes: [
        {
          from: CUT + 4 * DAY_MS,
          to: FOREVER,
          cause: "account not found",
          readOn: "2026-11-20",
        },
      ],
    };
    expect(covered(gone, whole, CUT + 5 * DAY_MS, CUT + 6 * DAY_MS)).toBe(
      false,
    );
  });
});

describe("a re-parse after a recorded fix (F3 b)", () => {
  it("closes a rejected rows' hole whose kept rows now pass, and keeps one whose row still fails", () => {
    const root = path.join(scratch, "reparse");
    const store = new PaperStore(root);
    const rawDay = path.join(root, "raw", "2026-11-12");
    mkdirSync(rawDay, { recursive: true });
    const line = (address: string, rows: unknown[]) =>
      `${DAY1}\t${JSON.stringify({ path: `/v1/info/fills?address=${address}&start_timestamp=${DAY1}&end_timestamp=${DAY1 + DAY_MS}&sort=asc`, weight: 10, status: 200, ms: 1 })}\t${JSON.stringify({ data: rows, more: false, cursor: null })}\n`;
    writeFileSync(
      path.join(rawDay, "rest-04.jsonl.br"),
      brotliCompressSync(
        line(addr(1), [row(1, DAY1 + 10), row(2, DAY1 + 20)]) +
          line(addr(2), [row(3, DAY1 + 10), row(4, DAY1 + 20, { side: "?" })]),
      ),
    );
    const hole = {
      from: DAY1,
      to: DAY1 + DAY_MS,
      cause: "rejected rows" as const,
      readOn: "2026-11-12",
      rows: 1,
    };
    const state = {
      version: 1 as const,
      accounts: {
        [addr(1)]: { P: DAY1 + DAY_MS, from: CUT, holes: [hole] },
        [addr(2)]: { P: DAY1 + DAY_MS, from: CUT, holes: [hole] },
      },
    };
    expect(reparseHoles(store, path.join(root, "raw"), state)).toEqual({
      closed: 1,
      still: 1,
      rows: 2,
    });
    expect(state.accounts[addr(1)]!.holes).toEqual([]);
    expect(state.accounts[addr(2)]!.holes).toEqual([hole]);
    expect(store.readRows(addr(1)).map((r) => r.trade_id)).toEqual([
      "1000001",
      "1000002",
    ]);
    expect(store.readRows(addr(2))).toEqual([]);
    expect(store.readState()).toEqual(state);
  });
});

describe("the experiment's files", () => {
  it("lists every file a run wrote, with its hash, in the day's manifest; writes a market-day once; refuses a store that fails its schema", () => {
    const root = path.join(scratch, "files");
    const store = new PaperStore(root);
    store.saveState({ version: 1, accounts: {} });
    expect(
      store.addRows(addr(1), [
        { ...FillRow.parse({ ...row(1, DAY1), trade_id: "1", order_id: "2" }) },
      ]),
    ).toBe(1);
    // The same row again adds nothing and writes nothing.
    expect(
      store.addRows(addr(1), [
        { ...FillRow.parse({ ...row(1, DAY1), trade_id: "1", order_id: "2" }) },
      ]),
    ).toBe(0);
    const day = {
      iid: 6,
      day: DAY1,
      marks: new Array<number | null>(1_440).fill(null),
      klines: { minute: [], trades: [], volume: [] },
      funding: [],
    };
    store.saveMarketDay(day);
    expect(() => store.saveMarketDay(day)).toThrow(/written once/);
    expect(store.readMarketDay(6, DAY1)).toEqual(day);
    store.flushManifest("2026-11-12");
    const lines = readFileSync(
      path.join(root, "manifest", "2026-11-12.sha256"),
      "utf8",
    )
      .trim()
      .split("\n")
      .map((l) => l.replace(/^[0-9a-f]{64} \*/, ""));
    expect(lines).toEqual([
      "state.json",
      `fills/${addr(1)}.json.gz`,
      `panel/6/${new Date(DAY1).toISOString().slice(0, 10)}.json.gz`,
    ]);
    writeFileSync(path.join(root, "state.json"), '{"version":2,"accounts":{}}');
    expect(() => store.readState()).toThrow();
    expect(readdirSync(root).filter((n) => n.endsWith(".tmp"))).toEqual([]);
  });
});
