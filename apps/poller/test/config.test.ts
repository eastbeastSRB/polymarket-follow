import { describe, expect, it } from "vitest";
import { parseConfig } from "../src/config.js";

const good = {
  RECORDINGS_ROOT: "F:\\polymarket-follow\\recordings",
  STATE_DIR: " E:\\polymarket-follow-run\\var ",
  MONGO_URI: "mongodb://127.0.0.1:27017",
  MONGO_DB: "polymarket_follow",
};

describe("parseConfig", () => {
  it("takes absolute folders and our database, and drops every other variable", () => {
    expect(parseConfig({ ...good, PATH: "C:\\Windows" })).toEqual({
      RECORDINGS_ROOT: "F:\\polymarket-follow\\recordings",
      STATE_DIR: "E:\\polymarket-follow-run\\var",
      MONGO_URI: "mongodb://127.0.0.1:27017",
      MONGO_DB: "polymarket_follow",
    });
    expect(
      parseConfig({ ...good, MONGO_DB: "polymarket_follow_test" }).MONGO_DB,
    ).toBe("polymarket_follow_test");
  });

  it("refuses a missing or relative folder", () => {
    expect(() => parseConfig({ ...good, RECORDINGS_ROOT: undefined })).toThrow(
      /RECORDINGS_ROOT/,
    );
    expect(() =>
      parseConfig({ ...good, RECORDINGS_ROOT: "recordings" }),
    ).toThrow(/absolute path/);
  });

  it("refuses any database but ours, and a missing one (Iron Rule 2)", () => {
    for (const name of [
      "polymarket_lab",
      "polymarket_follow2",
      "polymarket_follow_restore_2026-11-15",
      "admin",
      "",
    ]) {
      expect(() => parseConfig({ ...good, MONGO_DB: name }), name).toThrow(
        /MONGO_DB/,
      );
    }
    expect(() => parseConfig({ ...good, MONGO_DB: undefined })).toThrow(
      /MONGO_DB/,
    );
    expect(() =>
      parseConfig({ ...good, MONGO_URI: "http://127.0.0.1:27017" }),
    ).toThrow(/MONGO_URI/);
  });
});
