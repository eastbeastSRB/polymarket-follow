/**
 * The funding reader (src/copyh/funding.ts; rules.md C9, RM5): a window's
 * rows through Zod, each of the file's coin, its rates decimal text; the
 * nominal hour the time rounded to the nearest hour (a row 887,645 ms late,
 * as the 2025-07-19 10:00Z settlement in every coin, and one a few ms early,
 * each in its own hour; one exactly half an hour after goes to the next); no
 * coin's hour twice, within a window or across two; a step's rows through
 * the seal, by each row's time.
 */
import { describe, expect, it } from "vitest";
import { END_E } from "../src/copyh/design.js";
import {
  coinRows,
  fundingKey,
  nominalHour,
  readWindow,
  sealedRows,
} from "../src/copyh/funding.js";
import { StoreError } from "../src/copyh/run.js";
import { SEALED, SealedError } from "../src/copyh/seal.js";
import { HOUR_MS } from "../src/schedule.js";

const H = Date.parse("2025-07-19T10:00:00Z");
const row = (time: number, coin = "BTC") => ({
  coin,
  fundingRate: "0.0000125",
  premium: "-0.0003748",
  time,
});
const file = (rows: unknown) => Buffer.from(JSON.stringify(rows));

describe("the funding reader", { timeout: 60_000 }, () => {
  it("gives each row its nominal hour: late, early and on the hour each its own; half an hour after, the next", () => {
    const rows = readWindow(
      file([
        row(H - HOUR_MS + 23),
        row(H + 887_645),
        row(H + HOUR_MS - 500),
        row(H + 2 * HOUR_MS + 30 * 60_000),
      ]),
      "BTC",
    );
    expect(typeof rows).not.toBe("string");
    expect((rows as { hour: number }[]).map((r) => r.hour)).toEqual([
      H - HOUR_MS,
      H,
      H + HOUR_MS,
      H + 3 * HOUR_MS,
    ]);
    expect(nominalHour(H + 30 * 60_000 - 1)).toBe(H);
    expect(nominalHour(H - 30 * 60_000)).toBe(H);
    expect(readWindow(file([]), "BTC")).toEqual([]);
  });

  it("refuses a file that is not JSON, not the reply's shape, or of another coin", () => {
    expect(readWindow(Buffer.from("{"), "BTC")).toBe("not JSON");
    for (const bad of [
      { rows: [] },
      [{ ...row(H), fundingRate: 0.0001 }],
      [{ ...row(H), premium: "1e-5" }],
      [{ ...row(H), time: H + 0.5 }],
      [{ ...row(H), time: 2 ** 53 }],
      [{ ...row(H), coin: "" }],
      // Decimal text needs a digit before and after its point.
      ...["", "-", ".", "1.", ".5", "+1"].map((v) => [
        { ...row(H), fundingRate: v },
      ]),
      [{ ...row(H), premium: "--1" }],
    ])
      expect(readWindow(file(bad), "BTC"), JSON.stringify(bad)).toMatch(
        /^not fundingHistory's shape: /,
      );
    expect(readWindow(file([row(H, "ETH")]), "BTC")).toBe(
      "a row of another coin, ETH",
    );
  });

  it("stops on a coin's hour twice, in one window or across two, and on a window that fails", () => {
    const a = {
      key: fundingKey("BTC", H),
      bytes: file([row(H), row(H + 2_000)]),
    };
    expect(() => coinRows("BTC", [a])).toThrow(
      `${fundingKey("BTC", H)}: BTC's hour 2025-07-19T10:00:00.000Z twice`,
    );
    const end = H + 20 * 24 * HOUR_MS;
    const first = {
      key: fundingKey("BTC", H),
      bytes: file([row(end - 600_000)]),
    };
    const next = { key: fundingKey("BTC", end), bytes: file([row(end + 40)]) };
    expect(() => coinRows("BTC", [first, next])).toThrow(StoreError);
    const fine = {
      key: fundingKey("BTC", end),
      bytes: file([row(end + HOUR_MS)]),
    };
    expect(coinRows("BTC", [first, fine]).map((r) => r.hour)).toEqual([
      end,
      end + HOUR_MS,
    ]);
    expect(() =>
      coinRows("BTC", [{ key: "k", bytes: Buffer.from("[1]") }]),
    ).toThrow(/^k: not fundingHistory's shape/);
  });

  it("gives a step only the rows its seal opens: step 1 none at or after END_E", () => {
    const w = (t: number) => ({
      key: fundingKey("SOL", t),
      bytes: file([row(t, "SOL")]),
    });
    expect(sealedRows("SOL", [w(END_E - HOUR_MS)], SEALED)).toHaveLength(1);
    // The seal reads a row's time (C1), not its nominal hour: a row 500 ms before END_E is step 1's, its hour END_E.
    const early = sealedRows("SOL", [w(END_E - 500)], SEALED);
    expect([early.length, early[0]!.hour]).toEqual([1, END_E]);
    expect(() => sealedRows("SOL", [w(END_E)], SEALED)).toThrow(SealedError);
    expect(
      sealedRows("SOL", [w(END_E)], { sOpen: true, f2Open: false }),
    ).toHaveLength(1);
  });
});
