import { describe, expect, it } from "vitest";
import {
  BURST_CAP,
  admissionDelay,
  spentInWindow,
  type Spend,
} from "../src/api/admission.js";

const SHARE = 50;

describe("admissionDelay", () => {
  it("admits at once when nothing was spent", () => {
    expect(admissionDelay([], 1_000, 2, SHARE)).toBe(0);
  });

  it("waits for the trailing minute to free enough tokens", () => {
    // 25 reads of 2 tokens, one every 2 s from t=0: the minute holds 50.
    const spends: Spend[] = Array.from({ length: 25 }, (_, i) => ({
      at: i * 2_000,
      weight: 2,
    }));
    const now = 50_000;
    expect(spentInWindow(spends, now, 60_000)).toBe(50);
    // The read at t=0 leaves the window at t=60,000.
    expect(admissionDelay(spends, now, 2, SHARE)).toBe(10_000);
    // A weight of 4 needs the two oldest gone: t=2,000 + 60,000.
    expect(admissionDelay(spends, now, 4, SHARE)).toBe(12_000);
  });

  it("waits for the trailing 5 s to stay within 30", () => {
    const spends: Spend[] = [
      { at: 0, weight: 10 },
      { at: 1_000, weight: 10 },
      { at: 2_000, weight: 10 },
    ];
    expect(admissionDelay(spends, 3_000, 2, SHARE)).toBe(2_000);
    expect(admissionDelay(spends, 3_000, 12, SHARE)).toBe(3_000);
  });

  it("takes the later of the two windows", () => {
    const spends: Spend[] = [
      { at: 0, weight: 20 },
      { at: 30_000, weight: 30 },
    ];
    // Burst: 30 at t=30,000 frees at 35,000. Minute: 50 frees 20 at 60,000.
    expect(admissionDelay(spends, 31_000, 2, SHARE)).toBe(29_000);
  });

  it("counts a spend while it is younger than the window, not at its edge", () => {
    const spends: Spend[] = [{ at: 0, weight: 50 }];
    expect(admissionDelay(spends, 59_999, 1, 50)).toBe(1);
    expect(admissionDelay(spends, 60_000, 1, 50)).toBe(0);
    expect(spentInWindow(spends, 59_999, 60_000)).toBe(50);
    expect(spentInWindow(spends, 60_000, 60_000)).toBe(0);
  });

  it("refuses a weight that can never fit", () => {
    expect(() => admissionDelay([], 0, 51, SHARE)).toThrow(/never fit/);
    expect(() => admissionDelay([], 0, BURST_CAP + 1, 200)).toThrow(
      /never fit/,
    );
  });

  it("keeps every trailing minute and 5 s within the caps over a long random run", () => {
    let seed = 7;
    const random = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
      return seed / 2_147_483_648;
    };
    const weights = [1, 2, 2, 5, 10];
    const spends: Spend[] = [];
    let now = 0;
    for (let i = 0; i < 3_000; i += 1) {
      now += Math.floor(random() * 3_000);
      const weight = weights[Math.floor(random() * weights.length)]!;
      now += admissionDelay(spends, now, weight, SHARE);
      spends.push({ at: now, weight });
      expect(spentInWindow(spends, now, 60_000)).toBeLessThanOrEqual(SHARE);
      expect(spentInWindow(spends, now, 5_000)).toBeLessThanOrEqual(BURST_CAP);
    }
  });
});
