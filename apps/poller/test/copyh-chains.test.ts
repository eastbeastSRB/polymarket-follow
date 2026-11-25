/**
 * Chain heads (src/copyh/chains.ts; rules.md C3; the supervisor's rulings 3
 * and 5 on COPYH-STORE's differences): one chain, in the archive's order and
 * out of it; sells; several chains in one matching event; two heads with one
 * text; a fill that continues nothing; a fill that could follow two follows
 * the earlier in the archive; values floats or `toPrecision(12)` would
 * misread, compared exactly; exponents; a large close in hundreds of fills,
 * one chain whose float sum leaves the kit a residue (L3).
 */
import { describe, expect, it } from "vitest";
import { chainCount, chainHeads, type ChainFill } from "../src/copyh/chains.js";

const B = (startPosition: number, sz: number): ChainFill => ({
  startPosition,
  sz,
  side: 1,
});
const A = (startPosition: number, sz: number): ChainFill => ({
  startPosition,
  sz,
  side: -1,
});

describe("chain heads", { timeout: 60_000 }, () => {
  it("give a lone fill its own startPosition", () => {
    expect(chainHeads([B(2.5, 1)])).toEqual([2.5]);
  });

  it("give every fill of one chain its head, in the archive's order or out of it", () => {
    const chain = [B(0, 1), B(1, 2), B(3, 0.5)];
    expect(chainHeads(chain)).toEqual([0, 0, 0]);
    expect(chainHeads([chain[2]!, chain[0]!, chain[1]!])).toEqual([0, 0, 0]);
  });

  it("follow a sell's chain downwards", () => {
    expect(chainHeads([A(5, 2), A(3, 3), A(0, 1)])).toEqual([5, 5, 5]);
    expect(chainHeads([A(0, 1), A(5, 2), A(3, 3)])).toEqual([5, 5, 5]);
  });

  it("keep several chains apart, and a fill that continues nothing its own head", () => {
    expect(
      chainHeads([B(0, 1), B(10, 1), B(1, 1), B(11, 4), B(50, 1)]),
    ).toEqual([0, 10, 0, 10, 50]);
    expect(chainCount([B(0, 1), B(10, 1), B(1, 1), B(11, 4), B(50, 1)])).toBe(
      3,
    );
    expect(chainCount([B(0, 1), B(1, 1)])).toBe(1);
    expect(chainCount([A(5, 1)])).toBe(1);
  });

  it("give two chains from one startPosition one head text", () => {
    expect(chainHeads([B(0, 1), B(0, 2), B(1, 1), B(2, 1)])).toEqual([
      0, 0, 0, 0,
    ]);
    // One head text, two chains: the integrity counts two (D12).
    expect(chainCount([B(0, 1), B(0, 2), B(1, 1), B(2, 1)])).toBe(2);
  });

  it("let a fill that could follow two follow the earlier in the archive", () => {
    // b at 1 continues a1 (0 + 1) or a2 (−5 + 6); c at 1 the other.
    const a1 = B(0, 1);
    const a2 = B(-5, 6);
    const b = B(1, 1);
    expect(chainHeads([a1, a2, b])).toEqual([0, -5, 0]);
    expect(chainHeads([a2, a1, b])).toEqual([-5, 0, -5]);
    expect(chainHeads([a1, a2, b, B(1, 3)])).toEqual([0, -5, 0, -5]);
  });

  it("compare the decimals exactly, where a float sum or toPrecision(12) would misread", () => {
    // 0.1 + 0.2 is 0.30000000000000004 in floats: the chain holds on the decimals.
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(chainHeads([B(0.1, 0.2), B(0.3, 1)])).toEqual([0.1, 0.1]);
    // 1.0000000000001 + 1 is not 2, though both read 2.00000000000 at 12 digits.
    expect((1.0000000000001 + 1).toPrecision(12)).toBe((2).toPrecision(12));
    expect(chainHeads([B(1.0000000000001, 1), B(2, 1)])).toEqual([
      1.0000000000001, 2,
    ]);
  });

  it("read a double's exponent form exactly", () => {
    expect(String(1e-7)).toBe("1e-7");
    expect(chainHeads([B(1e-7, 2e-7), B(3e-7, 1)])).toEqual([1e-7, 1e-7]);
    expect(chainHeads([A(1.5e21, 5e20), A(1e21, 1)])).toEqual([1.5e21, 1.5e21]);
  });

  it("make one chain of a large short closed by 500 buys, whose float sum leaves the kit a residue", () => {
    // −98,765,432.1 closed by 500 buys of 197,530.8642: exact on the decimals.
    const start = -987654321000n; // in 1e-4
    const step = 1975308642n;
    const text = (v: bigint) => {
      const neg = v < 0n;
      const a = neg ? -v : v;
      const s = `${a / 10_000n}.${(a % 10_000n).toString().padStart(4, "0")}`;
      return Number(neg ? `-${s}` : s);
    };
    const fills = Array.from({ length: 500 }, (_, i) =>
      B(text(start + BigInt(i) * step), 197530.8642),
    );
    expect(text(start + 500n * step)).toBe(0);
    expect(chainHeads(fills)).toEqual(fills.map(() => -98765432.1));
    // The kit sums the sizes as floats: the event's after is a residue it reads as a reduce (L3's count).
    const net = fills.reduce((s, f) => s + f.sz, 0);
    const after = -98765432.1 + net;
    expect(Math.abs(after)).toBeGreaterThanOrEqual(1e-9);
    expect(Math.abs(after)).toBeLessThan(1e-6);
  });
});
