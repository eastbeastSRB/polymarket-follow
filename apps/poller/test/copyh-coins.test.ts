/**
 * COPY-H's coins (src/copyh/coins.ts; rules.md C3):
 * `coins.json` from a stored `meta` reply held to its manifest line, in the
 * reply's order, delisted coins kept; a coin's form (main-dex-shaped, spot,
 * builder dex).
 */
import { describe, expect, it } from "vitest";
import {
  CoinsFile,
  META_KEY,
  coinsFromMeta,
  formOfCoin,
  iidsOf,
} from "../src/copyh/coins.js";
import { StoreError, sha256 } from "../src/copyh/run.js";

const meta = (universe: object[]) =>
  Buffer.from(
    JSON.stringify({ universe, marginTables: [], collateralToken: 0 }),
  );
const lineOf = (b: Buffer, fetchedAt = "2026-11-25T18:00:00.000Z") => ({
  key: META_KEY,
  bytes: b.length,
  sha256: sha256(b),
  fetchedAt,
});
const UNIVERSE = [
  { szDecimals: 5, name: "BTC", maxLeverage: 40, marginTableId: 56 },
  { szDecimals: 4, name: "ETH", maxLeverage: 25 },
  { szDecimals: 0, name: "kPEPE", maxLeverage: 10, isDelisted: false },
  { szDecimals: 1, name: "OLD", maxLeverage: 3, isDelisted: true },
];

describe("coins.json", { timeout: 60_000 }, () => {
  it("lists the reply's coins in its universe order, delisted ones kept with their flag, the reply named by its line", () => {
    const b = meta(UNIVERSE);
    const f = coinsFromMeta(b, lineOf(b));
    expect(f.meta).toEqual({
      key: META_KEY,
      bytes: b.length,
      sha256: sha256(b),
      read: "2026-11-25T18:00:00.000Z",
    });
    expect(f.coins).toEqual([
      { iid: 0, name: "BTC", szDecimals: 5, delisted: false },
      { iid: 1, name: "ETH", szDecimals: 4, delisted: false },
      { iid: 2, name: "kPEPE", szDecimals: 0, delisted: false },
      { iid: 3, name: "OLD", szDecimals: 1, delisted: true },
    ]);
    expect(CoinsFile.parse(JSON.parse(JSON.stringify(f)))).toEqual(f);
    expect(iidsOf(f).get("kPEPE")).toBe(2);
  });

  it("refuses a reply that is not the bytes its line names, not JSON, not meta's shape, or names a coin twice", () => {
    const b = meta(UNIVERSE);
    expect(() =>
      coinsFromMeta(b, { ...lineOf(b), bytes: b.length + 1 }),
    ).toThrow("not the bytes its manifest line names");
    expect(() =>
      coinsFromMeta(b, { ...lineOf(b), sha256: "0".repeat(64) }),
    ).toThrow(StoreError);
    expect(() =>
      coinsFromMeta(b, { ...lineOf(b), key: "info/x.json" }),
    ).toThrow(`info/x.json is not ${META_KEY}`);
    const notJson = Buffer.from("{");
    expect(() => coinsFromMeta(notJson, lineOf(notJson))).toThrow("not JSON");
    for (const u of [[], [{ name: "BTC" }], [{ szDecimals: 5, name: "" }]]) {
      const x = meta(u);
      expect(() => coinsFromMeta(x, lineOf(x)), JSON.stringify(u)).toThrow(
        "not meta's shape",
      );
    }
    const twice = meta([UNIVERSE[0]!, UNIVERSE[0]!]);
    expect(() => coinsFromMeta(twice, lineOf(twice))).toThrow("named twice");
  });

  it("refuses a file whose iid is not its index", () => {
    const b = meta(UNIVERSE);
    const f = coinsFromMeta(b, lineOf(b));
    const moved = {
      ...f,
      coins: f.coins.map((c, i) => ({ ...c, iid: i === 1 ? 7 : i })),
    };
    expect(() => CoinsFile.parse(moved)).toThrow("not its index");
  });
});

describe("a coin's form", { timeout: 60_000 }, () => {
  it("reads a builder dex's, spot's and the main dex's shape", () => {
    expect(formOfCoin("xyz:TSLA")).toBe("builder");
    for (const c of ["@107", "@0", "PURR/USDC"])
      expect(formOfCoin(c), c).toBe("spot");
    for (const c of ["BTC", "kPEPE", "HYPE", "#12"])
      expect(formOfCoin(c), c).toBe("main");
  });
});
