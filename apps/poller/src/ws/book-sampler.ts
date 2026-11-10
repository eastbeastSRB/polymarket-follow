/**
 * Books are stored once a second when they changed (COLLECTOR-PLAN §1.1):
 * the last frame of each second — by the server's `ts`, so all markets are
 * sampled at the same tick — is written if its levels differ from the last
 * written frame of that market; the first sample of each hour (by our receive
 * time, which picks the file) is written regardless, so an hour's file
 * stands alone. A second is known to be over when that market's next frame
 * belongs to a later one.
 */
import { hourStart } from "../schedule.js";

export type BookLine = { iid: number; recvMs: number; text: string };

type Sample = { second: number; recvMs: number; text: string; levels: string };
type MarketState = {
  iid: number;
  pending: Sample | null;
  lastLevels: string | null;
  lastHour: number | null;
};

export class BookSampler {
  private readonly markets = new Map<number, MarketState>();

  /** `levels` is any text that is equal exactly when two frames' levels are equal. */
  onFrame(
    iid: number,
    tsMs: number,
    recvMs: number,
    text: string,
    levels: string,
  ): BookLine | null {
    let market = this.markets.get(iid);
    if (market === undefined) {
      market = { iid, pending: null, lastLevels: null, lastHour: null };
      this.markets.set(iid, market);
    }
    const second = Math.floor(tsMs / 1_000);
    const due =
      market.pending !== null && second > market.pending.second
        ? this.emit(market)
        : null;
    market.pending = { second, recvMs, text, levels };
    return due;
  }

  /** The held frames, at a stop: each is the last one seen in its second. */
  flushAll(): BookLine[] {
    const lines: BookLine[] = [];
    for (const market of this.markets.values()) {
      const line = this.emit(market);
      if (line) lines.push(line);
    }
    return lines;
  }

  /** A market no longer subscribed: its held frame is returned and its state dropped. */
  forget(iid: number): BookLine | null {
    const market = this.markets.get(iid);
    this.markets.delete(iid);
    return market ? this.emit(market) : null;
  }

  private emit(market: MarketState): BookLine | null {
    const sample = market.pending;
    if (sample === null) return null;
    market.pending = null;
    const hour = hourStart(sample.recvMs);
    if (sample.levels === market.lastLevels && hour === market.lastHour) {
      return null;
    }
    market.lastLevels = sample.levels;
    market.lastHour = hour;
    return { iid: market.iid, recvMs: sample.recvMs, text: sample.text };
  }
}
