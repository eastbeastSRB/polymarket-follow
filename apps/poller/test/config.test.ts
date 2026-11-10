import { describe, expect, it } from "vitest";
import { parseConfig } from "../src/config.js";

describe("parseConfig", () => {
  it("takes absolute folders and drops every other variable", () => {
    const config = parseConfig({
      RECORDINGS_ROOT: "F:\\polymarket-follow\\recordings",
      STATE_DIR: " E:\\polymarket-follow-run\\var ",
      PATH: "C:\\Windows",
    });
    expect(config).toEqual({
      RECORDINGS_ROOT: "F:\\polymarket-follow\\recordings",
      STATE_DIR: "E:\\polymarket-follow-run\\var",
    });
  });

  it("refuses a missing or relative folder", () => {
    expect(() => parseConfig({ STATE_DIR: "E:\\var" })).toThrow(
      /RECORDINGS_ROOT/,
    );
    expect(() =>
      parseConfig({ RECORDINGS_ROOT: "recordings", STATE_DIR: "E:\\var" }),
    ).toThrow(/absolute path/);
  });
});
