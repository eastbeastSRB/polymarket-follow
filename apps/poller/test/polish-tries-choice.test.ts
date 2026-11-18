/**
 * The choice rule (src/polish/tries/choice.ts): adoption at t ≥ 2.5 with
 * the gain floor and the E floors, each reason alone at its boundary; one
 * change a family and three families at most, ties to the log's order; the
 * print-only tries never adopted; C at most two evaluations (decisions
 * 2026-11-18, "POLISH-EXPLORE's plan approved", 3), none computed after a
 * pass or beyond the order.
 */
import { describe, expect, it } from "vitest";
import {
  adoptedOf,
  chooseOnC,
  passesC,
  refusedFor,
  type CheckOnC,
  type Family,
  type TryOnE,
} from "../src/polish/tries/choice.js";

const ok = { mean: true, days: true, coins: true };
const tryOf = (
  name: string,
  family: Family,
  order: number,
  t: number | null,
  d = 30,
  more: Partial<TryOnE> = {},
): TryOnE => ({
  name,
  family,
  order,
  adoptable: true,
  d,
  t,
  floors: ok,
  ...more,
});
const GAIN = 10;

describe("adoption on E", () => {
  it("needs t ≥ 2.5, D at the gain floor and every E floor, each alone at its boundary; never a print-only try", () => {
    expect(refusedFor(tryOf("A", "S", 1, 2.5, 10), GAIN)).toEqual([]);
    expect(refusedFor(tryOf("A", "S", 1, 2.4999), GAIN)).toEqual([
      "t below 2.5",
    ]);
    expect(refusedFor(tryOf("A", "S", 1, null), GAIN)).toEqual(["t below 2.5"]);
    expect(refusedFor(tryOf("A", "S", 1, 3, 9.9999), GAIN)).toEqual([
      "below the gain floor",
    ]);
    for (const k of ["mean", "days", "coins"] as const)
      expect(
        refusedFor(
          tryOf("A", "S", 1, 3, 30, { floors: { ...ok, [k]: false } }),
          GAIN,
        ),
      ).toEqual([`the ${k} floor`]);
    expect(
      refusedFor(tryOf("N7", "N", 31, 9, 99, { adoptable: false }), GAIN),
    ).toEqual(["print only"]);
    expect(
      adoptedOf([tryOf("N7", "N", 31, 9, 99, { adoptable: false })], GAIN),
    ).toEqual([]);
  });

  it("keeps one change a family, the largest t, and the three largest families; ties to the earlier in the log", () => {
    const tries = [
      tryOf("S1", "S", 1, 2.6),
      tryOf("D0", "D", 2, 3.0),
      tryOf("D15", "D", 3, 3.4),
      tryOf("H1", "H", 5, 4.0),
      tryOf("H2", "H", 6, 4.0),
      tryOf("W1", "W", 10, 2.7),
      tryOf("R1", "R", 15, 2.49),
    ];
    expect(adoptedOf(tries, GAIN).map((x) => x.name)).toEqual([
      "H1",
      "D15",
      "W1",
    ]);
    // A tie between families goes to the earlier in the log.
    expect(
      adoptedOf([tryOf("W1", "W", 10, 3), tryOf("S1", "S", 1, 3)], GAIN).map(
        (x) => x.name,
      ),
    ).toEqual(["S1", "W1"]);
    expect(adoptedOf([], GAIN)).toEqual([]);
  });
});

describe("C, at most two evaluations", () => {
  const pass = (rule: string): CheckOnC => ({
    rule,
    t: 1.0,
    floors: { ...ok, footprint: true },
  });
  const fail = (rule: string): CheckOnC => ({
    rule,
    t: 0.9999,
    floors: { ...ok, footprint: true },
  });
  const run = async (adopted: TryOnE[], passing: string[]) => {
    const calls: string[] = [];
    const r = await chooseOnC(adopted, (rule) => {
      calls.push(rule);
      return Promise.resolve(passing.includes(rule) ? pass(rule) : fail(rule));
    });
    return { ...r, calls };
  };
  const A = tryOf("A", "H", 5, 4.0);
  const B = tryOf("B", "S", 1, 3.0);

  it("passes at t ≥ 1.0 with every F2 floor, the footprint among them", () => {
    expect(passesC(pass("N"))).toBe(true);
    expect(passesC(fail("N"))).toBe(false);
    expect(
      passesC({ rule: "N", t: null, floors: { ...ok, footprint: true } }),
    ).toBe(false);
    for (const k of ["mean", "days", "coins", "footprint"] as const)
      expect(
        passesC({
          rule: "N",
          t: 5,
          floors: { ...ok, footprint: true, [k]: false },
        }),
        k,
      ).toBe(false);
  });

  it("nothing adopted: B0, nothing evaluated; one adopted: N alone", async () => {
    expect(await run([], ["N"])).toMatchObject({ goes: "B0", calls: [] });
    expect(await run([A], ["N"])).toMatchObject({ goes: "N", calls: ["N"] });
    expect(await run([A], [])).toMatchObject({ goes: "B0", calls: ["N"] });
  });

  it("N first, then only the largest-t change; B0 when both fail, the other change never evaluated", async () => {
    expect(await run([A, B], ["N", "A", "B"])).toMatchObject({
      goes: "N",
      calls: ["N"],
    });
    expect(await run([A, B], ["A", "B"])).toMatchObject({
      goes: "A",
      calls: ["N", "A"],
    });
    const r = await run([A, B], ["B"]);
    expect(r).toMatchObject({ goes: "B0", calls: ["N", "A"] });
    expect(r.evaluations.map((e) => e.rule)).toEqual(["N", "A"]);
  });
});
