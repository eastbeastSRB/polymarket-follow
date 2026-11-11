/**
 * The clock watch (COLLECTOR-PLAN §1.4 item 9 and §1.7, "Clock drift"): each
 * minute, the smallest (our receive time − the server's `ts`) over the book
 * frames. It stays near the network's delay (102–103 ms in the plan's run,
 * 2026-11-10) and moves if our clock drifts; over 2 s is a WATCH. A late
 * burst after a stall leaves it alone, since a minute's smallest counts.
 */
import { MINUTE_MS } from "../schedule.js";

export const CLOCK_WATCH_MS = 2_000;

export type ClockMinute = { minuteStart: number; minOffsetMs: number };

export class ClockWatch {
  private minute: number | null = null;
  private min: number | null = null;
  /** The last minute closed. */
  last: ClockMinute | null = null;

  /** One book frame; returns the minute it closed, when it opened a new one. */
  note(recvMs: number, ts: number): ClockMinute | null {
    const minute = Math.floor(recvMs / MINUTE_MS);
    let closed: ClockMinute | null = null;
    if (this.minute === null || minute > this.minute) {
      if (this.minute !== null && this.min !== null) {
        closed = {
          minuteStart: this.minute * MINUTE_MS,
          minOffsetMs: this.min,
        };
        this.last = closed;
      }
      this.minute = minute;
      this.min = null;
    }
    const offset = recvMs - ts;
    this.min = this.min === null ? offset : Math.min(this.min, offset);
    return closed;
  }
}
