/**
 * The one client of the Perps REST API (code-rules: one client holds the
 * budget and the back-off). Keyless GETs of the routes below only (Iron Rule
 * 1), one at a time, each admitted against the share before it is sent; every
 * call is one line of the hour's `rest` file, which is the call log.
 */
import type { z } from "zod";
import { type Clock, realClock } from "../clock.js";
import type { Logger } from "../log.js";
import { inNightlyPause, utcDate } from "../schedule.js";
import type { Recorder } from "../store/files.js";
import {
  BURST_MS,
  WINDOW_MS,
  admissionDelay,
  spentInWindow,
  type Spend,
} from "./admission.js";
import {
  BboReply,
  ExchangeReply,
  InstrumentsReply,
  TickersReply,
  unknownKeyPaths,
} from "./schemas.js";

export const API_BASE = "https://api.perpetuals.polymarket.com";
export const USER_AGENT = "polymarket-follow";
export const REQUEST_TIMEOUT_MS = 15_000;
/** The collector's share of the 250 a minute (decisions 2026-11-07, wave 1 closed; COLLECTOR-PLAN §1.1). */
export const COLLECTOR_SHARE = 50;

/** Weights from the spec (external-apis, "Rate limit — measured"). */
export const ROUTES = {
  tickers: { path: "/v1/info/tickers", weight: 2, schema: TickersReply },
  exchange: { path: "/v1/info/exchange", weight: 2, schema: ExchangeReply },
  instruments: {
    path: "/v1/info/instruments",
    weight: 2,
    schema: InstrumentsReply,
  },
  bbo: { path: "/v1/info/bbo", weight: 2, schema: BboReply },
} as const;

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

export type Outcome<T> =
  { ok: true; data: T; recvMs: number } | { ok: false; reason: Failure };

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

export class RestClient {
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
    private readonly share: number,
    private readonly recorder: Pick<Recorder, "write">,
    private readonly log: Logger,
    private readonly fetchFn: typeof fetch = fetch,
    private readonly clock: Clock = realClock,
  ) {
    for (const { path } of Object.values(ROUTES)) {
      if (!path.startsWith("/v1/info/")) throw new Error(`route ${path}`);
    }
  }

  /** Queued behind earlier requests; dropped if it cannot be sent within `maxWaitMs`. */
  get<R extends RouteName>(
    route: R,
    query: Record<string, string | number> = {},
    maxWaitMs = 30_000,
  ): Promise<Outcome<Reply<R>>> {
    const deadline = this.clock.monotonic() + maxWaitMs;
    const run = this.queue.then(() => this.send(route, query, deadline));
    this.queue = run.catch(() => undefined);
    return run;
  }

  tokensInLastMinute(): number {
    return spentInWindow(this.spends, this.clock.monotonic(), WINDOW_MS);
  }

  private async send<R extends RouteName>(
    route: R,
    query: Record<string, string | number>,
    deadline: number,
  ): Promise<Outcome<Reply<R>>> {
    const spec = ROUTES[route] as (typeof ROUTES)[RouteName] | undefined;
    if (spec === undefined) throw new Error(`unknown route ${String(route)}`);
    const { path, weight } = spec;
    const schema: z.ZodType = spec.schema;
    for (;;) {
      if (restPaused(this.clock.wall())) return { ok: false, reason: "paused" };
      const now = this.clock.monotonic();
      const wait = Math.max(
        this.backoffUntil - now,
        admissionDelay(this.spends, now, weight, this.share),
      );
      if (wait <= 0) break;
      if (now + wait > deadline) {
        this.counts.dropped += 1;
        this.log.warn({ route, waitMs: Math.round(wait) }, "request dropped");
        return { ok: false, reason: "budget" };
      }
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
        headers: { "user-agent": USER_AGENT, accept: "application/json" },
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
      return { ok: false, reason: rateLimited ? "rate_limited" : "http_error" };
    }
    this.backoffMs = 0;
    this.backoffUntil = 0;

    let json: unknown;
    let parsed: z.ZodSafeParseResult<unknown> | undefined;
    try {
      json = JSON.parse(text);
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
    return { ok: true, data: parsed.data as Reply<R>, recvMs };
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
    route: RouteName,
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
