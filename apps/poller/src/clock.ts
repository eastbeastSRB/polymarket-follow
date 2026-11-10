import { performance } from "node:perf_hooks";

/**
 * Wall time stamps the records; monotonic time measures every wait and
 * silence, so a step of the wall clock never fakes one (COLLECTOR-PLAN §1.7,
 * "Clock drift").
 */
export type Clock = {
  wall(): number;
  monotonic(): number;
  sleep(ms: number): Promise<void>;
};

export const realClock: Clock = {
  wall: () => Date.now(),
  monotonic: () => performance.now(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};
