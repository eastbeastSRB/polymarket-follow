/**
 * A synthetic Perps API for the experiment's tests: fills by account and
 * minute data by market, paged as external-apis describes them (fills 100 a
 * page by cursor, [start, end); marks 1,000 a page, a bucket only if it ends
 * by `end_timestamp`; klines 1,000 a page, a candle opening at
 * `end_timestamp` included; funding 100 a page, newest first). Every value
 * is made up.
 */
import { pino } from "pino";
import { RestClient } from "../src/api/rest-client.js";
import type { Clock } from "../src/clock.js";
import { PAPER_LIMITS, PAPER_ROUTES } from "../src/paper/routes.js";
import { MINUTE_MS } from "../src/schedule.js";

export const log = pino({ level: "silent" });

/** A fill row as the API writes it; `big` writes trade_id as an integer literal beyond 2^53. */
export type RawRow = Record<string, unknown> & { timestamp: number };

export function row(
  n: number,
  timestamp: number,
  over: Record<string, unknown> = {},
): RawRow {
  return {
    trade_id: 1_000_000 + n,
    order_id: 2_000_000 + n,
    instrument_id: 6,
    timestamp,
    side: n % 2 ? "short" : "long",
    price: "100.5",
    quantity: "0.25",
    previous_size: n % 2 ? "0.25" : "0",
    fee: "0.01",
    total_fee: "0.01",
    pnl: "0",
    taker: true,
    liquidation: false,
    hash: "0x",
    ...over,
  };
}

export const addr = (n: number): string =>
  `0x${n.toString(16).padStart(40, "0")}`;

export type Call = { url: URL; at: number; wall: number };

export type World = {
  fills: Map<string, RawRow[]>;
  /** Market-days: market → minute instants with a mark, and klines' trade counts. */
  minutes: (iid: number, from: number, to: number) => number[];
  notFound: Set<string>;
  /** Literal JSON text to put in place of a row's quoted marker, e.g. a big id. */
  literals: Map<string, string>;
};

export function emptyWorld(): World {
  return {
    fills: new Map(),
    minutes: (_iid, from, to) => {
      const out: number[] = [];
      for (let t = from; t < to; t += MINUTE_MS) out.push(t);
      return out;
    },
    notFound: new Set(),
    literals: new Map(),
  };
}

function body(world: World, value: unknown): string {
  let text = JSON.stringify(value);
  for (const [marker, literal] of world.literals) {
    text = text.replaceAll(`"${marker}"`, literal);
  }
  return text;
}

export function answer(world: World, url: URL): Response {
  const q = (k: string) => url.searchParams.get(k);
  const num = (k: string) => Number(q(k));
  const iid = num("instrument_id");
  switch (url.pathname) {
    case "/v1/info/fills": {
      const address = q("address")!;
      if (world.notFound.has(address)) {
        return new Response('{"status":"err","error":"account not found"}', {
          status: 400,
        });
      }
      const start = num("start_timestamp");
      const end = num("end_timestamp");
      const rows = (world.fills.get(address) ?? []).filter(
        (r) => r.timestamp >= start && r.timestamp < end,
      );
      const offset = q("cursor") === null ? 0 : Number(q("cursor")!.slice(1));
      const page = rows.slice(offset, offset + 100);
      const more = offset + 100 < rows.length;
      return new Response(
        body(world, {
          data: page,
          more,
          cursor: more ? `c${offset + 100}` : null,
        }),
        { status: 200 },
      );
    }
    case "/v1/info/mark-history": {
      const start = num("start_timestamp");
      const end = num("end_timestamp");
      const buckets = world
        .minutes(iid, start, end)
        .filter((t) => t >= start && t + MINUTE_MS <= end);
      const page = buckets.slice(0, 1_000);
      return new Response(
        JSON.stringify({
          data: page.map((t) => [t, String(100 + ((t / MINUTE_MS) % 7))]),
          more: buckets.length > 1_000,
        }),
        { status: 200 },
      );
    }
    case "/v1/info/klines": {
      const start = num("start_timestamp");
      const end = num("end_timestamp");
      const opens = world
        .minutes(iid, start, end + 1)
        .filter((t) => t >= start && t <= end && (t / MINUTE_MS) % 3 === 0);
      const page = opens.slice(0, 1_000);
      return new Response(
        JSON.stringify({
          data: page.map((t) => [t, "1", "2", "0.5", "1.5", "0.125", 4]),
          more: opens.length > 1_000,
        }),
        { status: 200 },
      );
    }
    case "/v1/info/funding": {
      const start = num("start_timestamp");
      const end = num("end_timestamp");
      const stamps: number[] = [];
      for (
        let h = Math.ceil(start / 3_600_000) * 3_600_000;
        h + 50 < end;
        h += 3_600_000
      ) {
        if (h + 50 >= start) stamps.push(h + 50);
      }
      stamps.reverse();
      return new Response(
        JSON.stringify({
          data: stamps
            .slice(0, 100)
            .map((t) => ({ funding_rate: "0.0000125", timestamp: t })),
          more: stamps.length > 100,
        }),
        { status: 200 },
      );
    }
    default:
      return new Response("not found", { status: 404 });
  }
}

/** The real client on a clock that moves only when something waits; each call takes `latencyMs`. */
export function client(world: World, startWall: number, latencyMs = 300) {
  let mono = 0;
  const clock: Clock = {
    wall: () => startWall + mono,
    monotonic: () => mono,
    sleep: (ms) => {
      mono += ms;
      return Promise.resolve();
    },
  };
  const calls: Call[] = [];
  const fetchFn = ((input: string) => {
    const url = new URL(input);
    calls.push({ url, at: mono, wall: startWall + mono });
    mono += latencyMs;
    return Promise.resolve(answer(world, url));
  }) as typeof fetch;
  const rest = new RestClient(
    PAPER_ROUTES,
    PAPER_LIMITS,
    { write: () => undefined },
    log,
    fetchFn,
    clock,
  );
  return { rest, calls, clock };
}
