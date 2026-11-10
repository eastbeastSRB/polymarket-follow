import { describe, expect, it } from "vitest";
import { auditRows, sameDecimal, type Top } from "../src/jobs/price-audit.js";

const T = 1_794_272_437_000;
const row = (instrument_id: number, bid: string, ask: string) => ({
  instrument_id,
  bid_price: bid,
  ask_price: ask,
  timestamp: T,
});

describe("auditRows", () => {
  it("sorts each row into agree, a timing miss, another miss, or no book", () => {
    const tops: Record<number, Top[]> = {
      // agrees at +200 ms, the edge
      1: [
        { ts: T - 300, bid: "9", ask: "11" },
        { ts: T + 200, bid: "10", ask: "11.0" },
      ],
      // disagrees, and its best prices moved within the second
      2: [
        { ts: T - 800, bid: "5", ask: "6" },
        { ts: T + 100, bid: "5.1", ask: "6" },
      ],
      // disagrees with a steady book
      3: [
        { ts: T - 100, bid: "7", ask: "8" },
        { ts: T + 100, bid: "7", ask: "8" },
      ],
      // frames, but none within 200 ms
      4: [{ ts: T - 201, bid: "1", ask: "2" }],
    };
    const counts = auditRows(
      [
        row(1, "10.00", "11"),
        row(2, "5.2", "6"),
        row(3, "7.5", "8"),
        row(4, "1", "2"),
        row(5, "1", "2"),
      ],
      (iid) => tops[iid] ?? [],
    );
    expect(counts).toEqual({
      rows: 5,
      agree: 1,
      timingMiss: 1,
      otherMiss: 1,
      noBook: 2,
    });
  });

  it("needs both sides to agree", () => {
    const tops = [{ ts: T, bid: "10", ask: "12" }];
    expect(auditRows([row(1, "10", "11")], () => tops).agree).toBe(0);
  });
});

describe("sameDecimal", () => {
  it("treats trailing zeros as the same price, and nothing else", () => {
    expect(sameDecimal("100.50", "100.5")).toBe(true);
    expect(sameDecimal("100.0", "100")).toBe(true);
    expect(sameDecimal("100", "1000")).toBe(false);
    expect(sameDecimal("10.05", "10.5")).toBe(false);
    expect(sameDecimal(null, "1")).toBe(false);
    expect(sameDecimal(null, null)).toBe(true);
  });
});
