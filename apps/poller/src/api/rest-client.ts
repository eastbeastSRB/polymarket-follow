/**
 * The client of the Perps REST API (code-rules: one client holds the budget
 * and the back-off). Keyless GETs of its route table only (Iron Rule 1), one
 * at a time, each admitted against its share and burst before it is sent;
 * every call is one line of the hour's `rest` file, which is the call log.
 * Each program has one instance: the poller with the routes below, the paper
 * experiment with its own (src/paper/routes.ts).
 */
import type { z } from "zod";
import { type Clock, realClock } from "../clock.js";
import type { Logger } from "../log.js";
import { inNightlyPause, utcDate } from "../schedule.js";
import type { Recorder } from "../store/files.js";
import {
  BURST_CAP,
  BURST_MS,
  WINDOW_MS,
  admissionDelay,
  spentInWindow,
  type Spend,
} from "./admission.js";
import {
  BboReply,
  CompetitionLeaderboardPage,
  CompetitionReply,
  CompetitionsReply,
  ExchangeReply,
  FeesReply,
  InstrumentsReply,
  LeaderboardPage,
  StockSplitsReply,
  TickersReply,
  unknownKeyPaths,
} from "./schemas.js";

export const API_BASE = "https://api.perpetuals.polymarket.com";
/** A generic client name: no project or personal name leaves this machine (code-rules, 2026-11-12). */
export const USER_AGENT = "data-collector/1.0";
export const REQUEST_TIMEOUT_MS = 15_000;
/** The collector's share of the 250 a minute (decisions 2026-11-07, wave 1 closed; COLLECTOR-PLAN §1.1). */
export const COLLECTOR_SHARE = 50;

/** JSON.parse's reviver; `context.source` is the value's text as received (Node 24). */
export type Reviver = (
  key: string,
  value: unknown,
  context?: { source?: string },
) => unknown;

export type RouteSpec = {
  readonly path: string;
  readonly weight: number;
  readonly schema: z.ZodType;
  readonly reviver?: Reviver;
};

export type RouteTable = Readonly<Record<string, RouteSpec>>;

/** A client instance's limits and its User-Agent. */
export type ClientLimits = {
  share: number;
  burst: number;
  userAgent: string;
};

/** The collector's: 50 a minute, the whole burst cap, its own name. */
export const COLLECTOR_LIMITS: ClientLimits = {
  share: COLLECTOR_SHARE,
  burst: BURST_CAP,
  userAgent: USER_AGENT,
};

/**
 * Weights from the spec (external-apis, "Rate limit — measured"); a cached
 * read may cost less, and is charged in full. `stock-splits` publishes none
 * and is charged 10 (COLLECTOR-PLAN §1.1).
 */
export const ROUTES = {
  tickers: { path: "/v1/info/tickers", weight: 2, schema: TickersReply },
  exchange: { path: "/v1/info/exchange", weight: 2, schema: ExchangeReply },
  instruments: {
    path: "/v1/info/instruments",
    weight: 2,
    schema: InstrumentsReply,
  },
  bbo: { path: "/v1/info/bbo", weight: 2, schema: BboReply },
  leaderboard: {
    path: "/v1/info/leaderboard",
    weight: 5,
    schema: LeaderboardPage,
  },
  competitions: {
    path: "/v1/info/competitions",
    weight: 1,
    schema: CompetitionsReply,
  },
  competition: {
    path: "/v1/info/competition",
    weight: 1,
    schema: CompetitionReply,
  },
  "competition/leaderboard": {
    path: "/v1/info/competition/leaderboard",
    weight: 1,
    schema: CompetitionLeaderboardPage,
  },
  fees: { path: "/v1/info/fees", weight: 2, schema: FeesReply },
  "stock-splits": {
    path: "/v1/info/stock-splits",
    weight: 10,
    schema: StockSplitsReply,
  },
} as const satisfies RouteTable;

export type RouteName = keyof typeof ROUTES;
export type Reply<R extends RouteName> = z.infer<(typeof ROUTES)[R]["schema"]>;

export type Failure =
  | "paused"
  | "budget"
  | "rate_limited"
  | "http_error"
  | "timeout"
  | "network"
  | "rejected";

/** `served`: the reply's `date` and `age` headers (CloudFront can serve a reply minutes old). */
export type Served = { date: string | null; age: string | null };

/** An HTTP error other than a 429 carries its status and body (a 400 can name its cause). */
export type Outcome<T> =
  | { ok: true; data: T; recvMs: number; served: Served }
  | { ok: false; reason: Failure; status?: number; text?: string };

/** After a 429 from 2 s, after any other failure from 1 s, doubling to 60 s; a success resets it. */
export function nextBackoffMs(
  previousMs: number,
  rateLimited: boolean,
): number {
  return Math.min(
    60_000,
    Math.max(rateLimited ? 2_000 : 1_000, previousMs * 2),
  );
}

/** Where and what, never the received value: a reason is logged. */
export function issuesText(error: z.ZodError): string {
  return error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");
}

/** No request may still be in flight inside the nightly window. */
export function restPaused(wallMs: number): boolean {
  return inNightlyPause(wallMs) || inNightlyPause(wallMs + REQUEST_TIMEOUT_MS);
}

export class RestClient<Routes extends RouteTable = typeof ROUTES> {
  readonly counts = {
    calls: 0,
    ok: 0,
    rateLimited: 0,
    httpErrors: 0,
    timeouts: 0,
    network: 0,
    rejected: 0,
    dropped: 0,
    peakMinute: 0,
    peakBurst: 0,
  };
  private spends: Spend[] = [];
  private backoffMs = 0;
  private backoffUntil = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private readonly unknownKeysSeen = new Set<string>();

  constructor(
    private readonly routes: Routes,
    private readonly limits: ClientLimits,
    private readonly recorder: Pick<Recorder, "write">,
    private readonly log: Logger,
    private readonly fetchFn: typeof fetch = fetch,
    private readonly clock: Clock = realClock,
  ) {
    for (const { path, weight } of Object.values(routes)) {
      if (!path.startsWith("/v1/info/")) throw new Error(`route ${path}`);
      if (weight > limits.share || weight > limits.burst) {
        throw new Error(`route ${path}: weight ${weight} exceeds the limits`);
      }
    }
  }

  /** Queued behind earlier requests; dropped if it cannot be sent within `maxWaitMs`. */
  get<R extends keyof Routes & string>(
    route: R,
    query: Record<string, string | number> = {},
    maxWaitMs = 30_000,
  ): Promise<Outcome<z.infer<Routes[R]["schema"]>>> {
    const deadline = this.clock.monotonic() + maxWaitMs;
    const run = this.queue.then(() => this.send(route, query, deadline));
    this.queue = run.catch(() => undefined);
    return run;
  }

  tokensInLastMinute(): number {
    return spentInWindow(this.spends, this.clock.monotonic(), WINDOW_MS);
  }

  private async send<R extends keyof Routes & string>(
    route: R,
    query: Record<string, string | number>,
    deadline: number,
  ): Promise<Outcome<z.infer<Routes[R]["schema"]>>> {
    const spec = (this.routes as RouteTable)[route];
    if (spec === undefined) throw new Error(`unknown route ${String(route)}`);
    const { path, weight } = spec;
    const schema: z.ZodType = spec.schema;
    for (;;) {
      if (restPaused(this.clock.wall())) return { ok: false, reason: "paused" };
      const now = this.clock.monotonic();
      const wait = Math.max(
        0,
        this.backoffUntil - now,
        admissionDelay(
          this.spends,
          now,
          weight,
          this.limits.share,
          this.limits.burst,
        ),
      );
      // Also a request whose turn in the queue came after its deadline.
      if (now + wait > deadline) {
        this.counts.dropped += 1;
        this.log.warn({ route, waitMs: Math.round(wait) }, "request dropped");
        return { ok: false, reason: "budget" };
      }
      if (wait === 0) break;
      await this.clock.sleep(wait);
    }

    const search = new URLSearchParams(
      Object.entries(query).map(([k, v]): [string, string] => [k, String(v)]),
    ).toString();
    const target = search ? `${path}?${search}` : path;
    const sentAt = this.clock.monotonic();
    this.spends = [
      ...this.spends.filter((s) => sentAt - s.at < WINDOW_MS),
      { at: sentAt, weight },
    ];
    this.counts.calls += 1;
    this.counts.peakMinute = Math.max(
      this.counts.peakMinute,
      spentInWindow(this.spends, sentAt, WINDOW_MS),
    );
    this.counts.peakBurst = Math.max(
      this.counts.peakBurst,
      spentInWindow(this.spends, sentAt, BURST_MS),
    );

    let status: number;
    let text: string;
    let headers: Headers;
    try {
      const res = await this.fetchFn(`${API_BASE}${target}`, {
        method: "GET",
        headers: {
          "user-agent": this.limits.userAgent,
          accept: "application/json",
        },
        redirect: "error",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      status = res.status;
      headers = res.headers;
      text = await res.text();
    } catch (err) {
      const timedOut = err instanceof Error && err.name === "TimeoutError";
      this.backOff(false);
      if (timedOut) this.counts.timeouts += 1;
      else this.counts.network += 1;
      const error = timedOut ? "timeout" : String(err);
      this.recordCall(target, weight, 0, sentAt, { error });
      this.log.warn({ route, error }, "request failed");
      return { ok: false, reason: timedOut ? "timeout" : "network" };
    }

    const meta = {
      date: headers.get("date"),
      age: headers.get("age"),
    };
    if (status !== 200) {
      const rateLimited = status === 429;
      this.backOff(rateLimited);
      if (rateLimited) this.counts.rateLimited += 1;
      else this.counts.httpErrors += 1;
      this.recordCall(target, weight, status, sentAt, meta, text);
      this.log.warn(
        { route, status, backoffMs: this.backoffMs },
        "request answered with an error",
      );
      return rateLimited
        ? { ok: false, reason: "rate_limited" }
        : { ok: false, reason: "http_error", status, text };
    }
    this.backoffMs = 0;
    this.backoffUntil = 0;

    let json: unknown;
    let parsed: z.ZodSafeParseResult<unknown> | undefined;
    try {
      json = JSON.parse(text, spec.reviver);
      parsed = schema.safeParse(json);
    } catch {
      parsed = undefined;
    }
    const kept = parsed?.success === true;
    const recvMs = this.recordCall(
      target,
      weight,
      status,
      sentAt,
      kept ? meta : { ...meta, rejected: true },
      kept ? text : undefined,
    );
    if (!parsed?.success) {
      this.counts.rejected += 1;
      const reason = parsed ? issuesText(parsed.error) : "not JSON";
      this.recorder.write(
        "rejected",
        recvMs,
        `${JSON.stringify({ source: target, reason })}\t${text}`,
      );
      this.log.error(
        { route },
        "reply failed its schema; kept raw in rejected",
      );
      return { ok: false, reason: "rejected" };
    }
    this.counts.ok += 1;
    this.noteUnknownKeys(route, schema, json, recvMs);
    return {
      ok: true,
      data: parsed.data as z.infer<Routes[R]["schema"]>,
      recvMs,
      served: meta,
    };
  }

  private backOff(rateLimited: boolean): void {
    this.backoffMs = nextBackoffMs(this.backoffMs, rateLimited);
    this.backoffUntil = this.clock.monotonic() + this.backoffMs;
  }

  /** One line of the call log: receive time, then `{path, weight, status, ms, …}`, then the body if kept. */
  private recordCall(
    target: string,
    weight: number,
    status: number,
    sentAt: number,
    extra: Record<string, unknown>,
    body?: string,
  ): number {
    const recvMs = this.clock.wall();
    const ms = Math.round(this.clock.monotonic() - sentAt);
    const meta = JSON.stringify({ path: target, weight, status, ms, ...extra });
    this.recorder.write(
      "rest",
      recvMs,
      body === undefined ? meta : `${meta}\t${body}`,
    );
    return recvMs;
  }

  private noteUnknownKeys(
    route: string,
    schema: z.ZodType,
    json: unknown,
    recvMs: number,
  ): void {
    for (const keyPath of unknownKeyPaths(schema, json)) {
      const seen = `${utcDate(recvMs)} ${route} ${keyPath}`;
      if (this.unknownKeysSeen.has(seen)) continue;
      this.unknownKeysSeen.add(seen);
      this.log.info({ route, keyPath }, "unknown key, kept in the raw text");
    }
  }
}
