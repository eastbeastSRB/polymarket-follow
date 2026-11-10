/**
 * Synthetic replies and a fake world for the pass tests, shaped by the spec
 * of 2026-11-10 (perps-openapi.json 55b198ce…); every value is made up.
 */
import type {
  Outcome,
  Reply,
  RestClient,
  RouteName,
} from "../src/api/rest-client.js";
import type { Clock } from "../src/clock.js";

/** A checksum-cased address: the API's form, which the store lower-cases. */
export const address = (n: number) =>
  `0xAbC${n.toString(16).padStart(37, "0")}`;

export function boardPage(
  window: string,
  sort: string,
  offset: number,
  timestamp: number,
  total: number,
  count = 100,
  account: (rank: number) => string = address,
): Reply<"leaderboard"> {
  return {
    window,
    sort_by: sort,
    timestamp,
    total,
    entries: Array.from({ length: count }, (_, i) => ({
      rank: offset + i + 1,
      account: account(offset + i + 1),
      pnl: `${900_000 + offset + i}.123456`,
      notional: "1000.5",
      account_value: "250.25",
      roi: "0.4527",
    })),
  };
}

export function tablePage(
  competitionId: number,
  offset: number,
  total: number,
  count: number,
  updatedAt: number,
): Reply<"competition/leaderboard"> {
  return {
    competition_id: competitionId,
    status: "live",
    updated_at: updatedAt,
    total,
    offset,
    final_results: false,
    entries: Array.from({ length: count }, (_, i) => ({
      rank: offset + i + 1,
      account: address(offset + i + 1),
      score: "77.7",
      pnl: "12.5",
      realized_pnl: "10",
      unrealized_pnl: "2.5",
      volume: "5000",
      boosted_volume: "7500",
      qualified: true,
      row_state: "live",
    })),
  };
}

export const ok = <T>(data: T, recvMs = 0): Outcome<T> => ({
  ok: true,
  data,
  recvMs,
  served: { date: null, age: null },
});

export type Call = {
  route: RouteName;
  query: Record<string, string | number>;
  maxWaitMs: number | undefined;
  at: number;
};

/**
 * A clock that moves only when something waits, and a client that answers
 * each call after `latencyMs` with `answer`'s outcome.
 */
export function world(
  startWall: number,
  answer: (
    route: RouteName,
    query: Record<string, string | number>,
  ) => Outcome<unknown>,
  latencyMs = 100,
) {
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
  const client = {
    get: (
      route: RouteName,
      query: Record<string, string | number> = {},
      maxWaitMs?: number,
    ) => {
      calls.push({ route, query, maxWaitMs, at: clock.wall() });
      mono += latencyMs;
      const out = answer(route, query);
      return Promise.resolve(out.ok ? { ...out, recvMs: clock.wall() } : out);
    },
  } as unknown as Pick<RestClient, "get">;
  return { clock, client, calls };
}
