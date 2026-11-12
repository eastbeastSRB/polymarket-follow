import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
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

  it("reads the run copy's settings, tools/poller.env: the poller's four, the backup's two and the paper experiment's folder, nothing else", () => {
    const text = readFileSync(
      new URL("../../../tools/poller.env", import.meta.url),
      "utf8",
    );
    const settings = parseEnv(text);
    expect(Object.keys(settings).sort()).toEqual([
      "BACKUP_LATEST",
      "BACKUP_ROOT",
      "MONGO_DB",
      "MONGO_URI",
      "PAPER_BACKUP",
      "PAPER_ROOT",
      "RECORDINGS_ROOT",
      "STATE_DIR",
    ]);
    expect(settings.PAPER_ROOT).toBe("F:\\polymarket-follow\\paper");
    expect([settings.BACKUP_ROOT, settings.BACKUP_LATEST]).toEqual([
      "F:\\backups\\polymarket-follow\\db",
      "E:\\backups\\polymarket-follow\\db",
    ]);
    expect(parseConfig(settings)).toEqual({
      RECORDINGS_ROOT: "F:\\polymarket-follow\\recordings",
      STATE_DIR: "E:\\polymarket-follow-run\\var",
      MONGO_URI: "mongodb://127.0.0.1:27017",
      MONGO_DB: "polymarket_follow",
    });
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
