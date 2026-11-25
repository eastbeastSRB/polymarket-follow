/**
 * COPY-H's dir values (src/copyh/dirs.ts; rules.md C3): `dirs.json`'s four
 * kinds, a value outside the list stopping the step, and the list's own
 * refusals.
 */
import { describe, expect, it } from "vitest";
import { DirsFile, kindOf, kindsOf } from "../src/copyh/dirs.js";

describe("dirs.json", { timeout: 60_000 }, () => {
  const file = DirsFile.parse({
    rule: "test",
    dirs: [
      { dir: "Open Long", kind: "trade" },
      { dir: "Settlement", kind: "forced" },
      { dir: "Liquidated Cross Long", kind: "forced" },
      { dir: "Net Child Vaults", kind: "vault" },
      { dir: "Split Outcome", kind: "outcome" },
    ],
  });

  it("gives each listed dir its kind", () => {
    const kinds = kindsOf(file);
    expect(
      [
        "Open Long",
        "Settlement",
        "Liquidated Cross Long",
        "Net Child Vaults",
        "Split Outcome",
      ].map((d) => kindOf(kinds, d)),
    ).toEqual(["trade", "forced", "forced", "vault", "outcome"]);
  });

  it("stops on a value outside the list, case and spaces counting", () => {
    const kinds = kindsOf(file);
    for (const d of ["Auto-Deleveraging", "open long", "Open Long "])
      expect(() => kindOf(kinds, d), d).toThrow(
        `the dir ${JSON.stringify(d)} is not in dirs.json: a ruling gives it its kind`,
      );
  });

  it("refuses a value listed twice, a kind of its own, and an empty list", () => {
    for (const dirs of [
      [
        { dir: "Open Long", kind: "trade" },
        { dir: "Open Long", kind: "forced" },
      ],
      [{ dir: "Open Long", kind: "spot" }],
      [],
    ])
      expect(
        DirsFile.safeParse({ rule: "test", dirs }).success,
        JSON.stringify(dirs),
      ).toBe(false);
  });
});
