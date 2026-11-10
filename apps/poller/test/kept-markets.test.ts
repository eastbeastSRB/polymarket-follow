import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pino } from "pino";
import { describe, expect, it } from "vitest";
import type { Outcome, Reply, RestClient } from "../src/api/rest-client.js";
import type { Clock } from "../src/clock.js";
import {
  MARKETS_FILE,
  awaitFirstList,
  marketKeeper,
  readKeptMarkets,
} from "../src/jobs/instruments.js";

const log = pino({ level: "silent" });
const dir = () => mkdtempSync(path.join(tmpdir(), "poller-markets-"));

function world(outcomes: Outcome<Reply<"instruments">>[]) {
  const sleeps: number[] = [];
  const clock: Clock = {
    wall: () => 0,
    monotonic: () => 0,
    sleep: (ms) => {
      sleeps.push(ms);
      return Promise.resolve();
    },
  };
  let asked = 0;
  const client = {
    get: () => {
      asked += 1;
      return Promise.resolve(outcomes.shift()!);
    },
  } as unknown as Pick<RestClient, "get">;
  const lists: number[][] = [];
  return {
    clock,
    client,
    sleeps,
    lists,
    onList: (ids: number[]) => lists.push(ids),
    asked: () => asked,
  };
}

const listed = (...ids: number[]): Outcome<Reply<"instruments">> => ({
  ok: true,
  recvMs: 0,
  data: ids.map((instrument_id) => ({ instrument_id, symbol: "S" })),
});

describe("awaitFirstList", () => {
  it("opens the streams from the kept list after the first failure, then corrects it at the first read", async () => {
    const w = world([
      { ok: false, reason: "paused" },
      { ok: false, reason: "paused" },
      listed(3, 1, 4),
    ]);
    const done = await awaitFirstList(
      w.client,
      [1, 2],
      w.onList,
      log,
      w.clock,
      () => false,
    );
    expect(done).toBe(true);
    expect(w.lists).toEqual([
      [1, 2],
      [1, 3, 4],
    ]);
    expect(w.sleeps).toEqual([1_000, 2_000]);
  });

  it("waits for the first read when no list is kept", async () => {
    const w = world([{ ok: false, reason: "network" }, listed(2)]);
    expect(
      await awaitFirstList(w.client, null, w.onList, log, w.clock, () => false),
    ).toBe(true);
    expect(w.lists).toEqual([[2]]);
  });

  it("uses the kept list without waiting for a failure only when the read fails", async () => {
    const w = world([listed(5)]);
    await awaitFirstList(w.client, [1], w.onList, log, w.clock, () => false);
    expect(w.lists).toEqual([[5]]);
    expect(w.sleeps).toEqual([]);
  });

  it("gives up when the poller stops", async () => {
    const w = world([
      { ok: false, reason: "paused" },
      { ok: false, reason: "paused" },
    ]);
    const done = await awaitFirstList(
      w.client,
      [7],
      w.onList,
      log,
      w.clock,
      () => w.asked() >= 1,
    );
    expect(done).toBe(false);
    expect(w.asked()).toBe(1);
    expect(w.lists).toEqual([[7]]);
  });
});

describe("the kept market list", () => {
  it("round-trips, and is rewritten only when the list changes", () => {
    const d = dir();
    expect(readKeptMarkets(d, log)).toBeNull();
    const keep = marketKeeper(d, null, log);
    keep([1, 2, 3]);
    expect(readKeptMarkets(d, log)).toEqual([1, 2, 3]);
    const marked = '{"savedAt":0,"markets":[1,2,3]}\n';
    writeFileSync(path.join(d, MARKETS_FILE), marked);
    keep([1, 2, 3]);
    expect(readFileSync(path.join(d, MARKETS_FILE), "utf8")).toBe(marked);
    keep([1, 3]);
    expect(readKeptMarkets(d, log)).toEqual([1, 3]);
  });

  it("does not rewrite the list it was started with", () => {
    const d = dir();
    writeFileSync(
      path.join(d, MARKETS_FILE),
      '{"savedAt":1,"markets":[4,5]}\n',
    );
    marketKeeper(d, readKeptMarkets(d, log), log)([4, 5]);
    expect(readFileSync(path.join(d, MARKETS_FILE), "utf8")).toBe(
      '{"savedAt":1,"markets":[4,5]}\n',
    );
  });

  it("refuses a kept list that does not parse", () => {
    const d = dir();
    writeFileSync(path.join(d, MARKETS_FILE), '{"markets":["x"]}');
    expect(readKeptMarkets(d, log)).toBeNull();
    writeFileSync(path.join(d, MARKETS_FILE), "{cut");
    expect(readKeptMarkets(d, log)).toBeNull();
  });
});
