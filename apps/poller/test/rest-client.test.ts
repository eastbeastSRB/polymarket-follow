import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pino } from "pino";
import { describe, expect, it } from "vitest";
import { spentInWindow, type Spend } from "../src/api/admission.js";
import {
  API_BASE,
  ROUTES,
  RestClient,
  type RouteName,
} from "../src/api/rest-client.js";
import type { Clock } from "../src/clock.js";
import type { Kind } from "../src/store/files.js";

const log = pino({ level: "silent" });
const NOON = Date.parse("2026-11-10T12:00:00Z");
const TICKERS =
  '[{"instrument_id":1,"symbol":"BTC-USD","index_price":"1","mark_price":"1","last_price":"1","mid_price":"1","open_interest":"1","funding_rate":"0","next_funding":1,"timestamp":1}]';

type Line = { kind: Kind; recvMs: number; text: string };
type Call = { url: string; init: RequestInit; at: number };

function world(
  answer: (url: string) => Response | Promise<Response>,
  wallStart = NOON,
) {
  let mono = 0;
  const sleeps: number[] = [];
  const clock: Clock = {
    wall: () => wallStart + mono,
    monotonic: () => mono,
    sleep: (ms) => {
      sleeps.push(ms);
      mono += ms;
      return Promise.resolve();
    },
  };
  const lines: Line[] = [];
  const recorder = {
    write: (kind: Kind, recvMs: number, text: string) => {
      lines.push({ kind, recvMs, text });
    },
  };
  const calls: Call[] = [];
  const fetchFn = ((url: string, init: RequestInit) => {
    calls.push({ url, init, at: mono });
    return Promise.resolve(answer(url));
  }) as typeof fetch;
  const client = new RestClient(50, recorder, log, fetchFn, clock);
  return {
    client,
    lines,
    calls,
    sleeps,
    advance: (ms: number) => (mono += ms),
  };
}

const meta = (line: Line) =>
  JSON.parse(line.text.split("\t")[0]!) as Record<string, unknown>;

describe("RestClient", () => {
  it("sends a keyless GET with our user agent and logs the call with its reply", async () => {
    const w = world(
      () =>
        new Response(TICKERS, {
          status: 200,
          headers: { date: "Tue, 10 Nov 2026 12:00:00 GMT", age: "1" },
        }),
    );
    const out = await w.client.get("tickers");
    expect(out).toMatchObject({
      ok: true,
      served: { date: "Tue, 10 Nov 2026 12:00:00 GMT", age: "1" },
    });
    expect(w.calls[0]!.url).toBe(`${API_BASE}/v1/info/tickers`);
    expect(w.calls[0]!.init.method).toBe("GET");
    expect(w.calls[0]!.init.headers).toEqual({
      "user-agent": "polymarket-follow",
      accept: "application/json",
    });
    expect(w.lines).toHaveLength(1);
    expect(w.lines[0]!.kind).toBe("rest");
    expect(w.lines[0]!.text).toBe(
      `{"path":"/v1/info/tickers","weight":2,"status":200,"ms":0,"date":"Tue, 10 Nov 2026 12:00:00 GMT","age":"1"}\t${TICKERS}`,
    );
  });

  it("puts the query in the path it logs", async () => {
    const w = world(() => new Response("[]", { status: 200 }));
    await w.client.get("instruments", { instrument_id: 51 });
    expect(w.calls[0]!.url).toBe(
      `${API_BASE}/v1/info/instruments?instrument_id=51`,
    );
    expect(meta(w.lines[0]!).path).toBe(
      "/v1/info/instruments?instrument_id=51",
    );
  });

  it("drops a reply that fails its schema: the call is logged without it, the reply goes raw to rejected", async () => {
    const w = world(
      () => new Response('[{"instrument_id":"x"}]', { status: 200 }),
    );
    const out = await w.client.get("tickers");
    expect(out).toEqual({ ok: false, reason: "rejected" });
    expect(w.lines.map((l) => l.kind)).toEqual(["rest", "rejected"]);
    expect(w.lines[0]!.text).not.toContain("\t");
    expect(meta(w.lines[0]!)).toMatchObject({ status: 200, rejected: true });
    const [rejectedMeta, raw] = w.lines[1]!.text.split("\t");
    expect(JSON.parse(rejectedMeta!)).toMatchObject({
      source: "/v1/info/tickers",
    });
    expect(raw).toBe('[{"instrument_id":"x"}]');
    expect(w.client.counts.rejected).toBe(1);
  });

  it("drops a reply that is not JSON", async () => {
    const w = world(() => new Response("<html>", { status: 200 }));
    expect(await w.client.get("exchange")).toEqual({
      ok: false,
      reason: "rejected",
    });
    expect(JSON.parse(w.lines[1]!.text.split("\t")[0]!)).toMatchObject({
      reason: "not JSON",
    });
  });

  it("backs off from 2 s after a 429, doubling, and resets after a success; the failed request is not retried", async () => {
    const statuses = [429, 429, 200, 429, 200];
    const w = world(() => new Response(TICKERS, { status: statuses.shift() }));
    expect(await w.client.get("tickers")).toEqual({
      ok: false,
      reason: "rate_limited",
    });
    expect(w.calls).toHaveLength(1);
    for (let i = 0; i < 4; i += 1) await w.client.get("tickers");
    // After the success the next 429 starts again from 2 s, not from 8.
    expect(w.sleeps).toEqual([2_000, 4_000, 2_000]);
    expect(w.calls.map((c) => c.at)).toEqual([0, 2_000, 6_000, 6_000, 8_000]);
    expect(w.client.counts).toMatchObject({ calls: 5, ok: 2, rateLimited: 3 });
  });

  it("backs off from 1 s after a server error, a timeout or a network failure, each logged", async () => {
    const answers: (() => Response)[] = [
      () => new Response("", { status: 503 }),
      () => {
        throw new DOMException("timed out", "TimeoutError");
      },
      () => {
        throw new TypeError("fetch failed");
      },
      () => new Response(TICKERS, { status: 200 }),
    ];
    const w = world(() => answers.shift()!());
    expect((await w.client.get("tickers")).ok).toBe(false);
    expect(await w.client.get("tickers")).toEqual({
      ok: false,
      reason: "timeout",
    });
    expect(await w.client.get("tickers")).toEqual({
      ok: false,
      reason: "network",
    });
    expect((await w.client.get("tickers")).ok).toBe(true);
    expect(w.sleeps).toEqual([1_000, 2_000, 4_000]);
    expect(w.lines.map((l) => meta(l))).toEqual([
      expect.objectContaining({ status: 503 }),
      expect.objectContaining({ status: 0, error: "timeout" }),
      expect.objectContaining({ status: 0, error: "TypeError: fetch failed" }),
      expect.objectContaining({ status: 200 }),
    ]);
  });

  it("sends nothing in the nightly window", async () => {
    const w = world(
      () => new Response(TICKERS, { status: 200 }),
      Date.parse("2026-11-10T02:40:00Z"),
    );
    expect(await w.client.get("tickers")).toEqual({
      ok: false,
      reason: "paused",
    });
    expect(w.calls).toHaveLength(0);
    expect(w.lines).toHaveLength(0);
  });

  it("admits every request inside 50 a minute and 30 in 5 s", async () => {
    const w = world(() => new Response(TICKERS, { status: 200 }));
    const outs = await Promise.all(
      Array.from({ length: 40 }, () => w.client.get("tickers", {}, 300_000)),
    );
    expect(outs.every((o) => o.ok)).toBe(true);
    const spends: Spend[] = [];
    for (const call of w.calls) {
      spends.push({ at: call.at, weight: 2 });
      expect(spentInWindow(spends, call.at, 60_000)).toBeLessThanOrEqual(50);
      expect(spentInWindow(spends, call.at, 5_000)).toBeLessThanOrEqual(30);
    }
    expect(w.calls.map((c) => c.at).slice(14, 17)).toEqual([0, 5_000, 5_000]);
    expect(w.calls[25]!.at).toBe(60_000);
    expect(w.client.counts).toMatchObject({ peakMinute: 50, peakBurst: 30 });
  });

  it("drops a request whose turn in the queue comes after its deadline", async () => {
    let advance = (_ms: number): number => 0;
    const w = world(() => {
      advance(20_000);
      return new Response(TICKERS, { status: 200 });
    });
    advance = w.advance;
    const slow = w.client.get("tickers");
    const queued = w.client.get("tickers", {}, 10_000);
    expect((await slow).ok).toBe(true);
    expect(await queued).toEqual({ ok: false, reason: "budget" });
    expect(w.calls).toHaveLength(1);
    expect(w.client.counts.dropped).toBe(1);
  });

  it("drops a request that could not be sent before its deadline", async () => {
    const w = world(() => new Response(TICKERS, { status: 200 }));
    for (let i = 0; i < 25; i += 1) await w.client.get("tickers");
    expect(await w.client.get("tickers", {}, 10_000)).toEqual({
      ok: false,
      reason: "budget",
    });
    expect(w.calls).toHaveLength(25);
    expect(w.client.counts.dropped).toBe(1);
  });
});

describe("Iron Rule 1: watch only", () => {
  it("knows only GET routes under /v1/info/", () => {
    for (const { path: p } of Object.values(ROUTES)) {
      expect(p.startsWith("/v1/info/")).toBe(true);
    }
  });

  it("refuses any route outside its table", async () => {
    const w = world(() => new Response("[]", { status: 200 }));
    await expect(w.client.get("orders" as RouteName)).rejects.toThrow(
      /unknown route/,
    );
    expect(w.calls).toHaveLength(0);
  });

  it("has no POST, PUT, PATCH or DELETE anywhere under src/", () => {
    const src = fileURLToPath(new URL("../src", import.meta.url));
    const files = readdirSync(src, {
      recursive: true,
      encoding: "utf8",
    }).filter((f) => f.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const text = readFileSync(path.join(src, file), "utf8");
      expect(text, file).not.toMatch(/\b(POST|PUT|PATCH|DELETE)\b/);
      expect(text, file).not.toMatch(/method:\s*["'`](?!GET["'`])/i);
    }
  });
});
