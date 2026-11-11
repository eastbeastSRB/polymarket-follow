/**
 * What `status` prints (COLLECTOR-PLAN §1.4 item 10, §1.2, §1.7): the rows of
 * R7's Status page that the collector can show before v1 — the process, the
 * connections, the jobs, the budget and the replies, the streams, the files,
 * the database, the price audit, the clock, the disks, the backup, and the
 * day's folder — from the heartbeat file, the day's file names and sizes,
 * `coverage.jsonl` and the manifests. Counts, sizes, ages and states only:
 * it never opens a recording, so no field of a row can appear (§1.3 item 7).
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { COLLECTOR_SHARE } from "../api/rest-client.js";
import { HEARTBEAT_FILE, STALE_HEARTBEAT_MS } from "../lock.js";
import { DAY_MS, utcDate } from "../schedule.js";
import { CLOCK_WATCH_MS } from "./clock-watch.js";
import { Heartbeat } from "./heartbeat.js";

/** A connection with no frame for 15 s is reconnected (code-rules, the watchdog). */
const FRAME_WATCH_MS = 15_000;

export type CoverageLine = {
  at: number;
  event: string;
  lastHeartbeatAt?: number | null;
};
export type DayFacts = {
  date: string;
  files: { name: string; bytes: number }[];
  coverage: CoverageLine[];
  unreadableCoverage: number;
  yesterday: { date: string; manifestFiles: number | null };
};

const CoverageEvent = z.object({
  event: z.string(),
  lastHeartbeatAt: z.number().nullable().optional(),
});
const Manifest = z.object({ files: z.array(z.unknown()) });

const age = (ms: number) =>
  ms < 120_000
    ? `${(ms / 1000).toFixed(1)} s`
    : `${Math.round(ms / 60_000)} min`;
const time = (ms: number) => new Date(ms).toISOString().slice(11, 19) + "Z";
const list = (counts: Record<string, unknown>) =>
  Object.entries(counts)
    .map(([k, v]) => `${k} ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(", ");

export function statusLines(
  heartbeat: Heartbeat | null,
  heartbeatAgeMs: number | null,
  day: DayFacts,
  backup: string | null,
): string[] {
  const out: string[] = [];
  if (heartbeat === null || heartbeatAgeMs === null) {
    out.push("process: DOWN - no readable heartbeat file");
  } else {
    const down = heartbeatAgeMs >= STALE_HEARTBEAT_MS;
    out.push(
      `process: ${down ? "DOWN" : "ok"} - pid ${heartbeat.pid}, heartbeat ${age(heartbeatAgeMs)} old, started ${new Date(heartbeat.startedAt).toISOString()}, rss ${heartbeat.memory.rssMb} MB`,
    );
    for (const [name, c] of Object.entries(heartbeat.connections)) {
      const quiet =
        c.lastFrameAt === null ? null : heartbeat.time - c.lastFrameAt;
      const watch = !c.open || quiet === null || quiet > FRAME_WATCH_MS;
      out.push(
        `connection ${name}: ${watch ? "WATCH" : "ok"} - ${c.open ? "open" : "closed"}, last frame ${quiet === null ? "never" : `${age(quiet)} before the heartbeat`}`,
      );
    }
    for (const [name, j] of Object.entries(heartbeat.jobs)) {
      out.push(
        `job ${name}: last run ${j.lastRunAt === null ? "never" : time(j.lastRunAt)}, last ok ${j.lastOkAt === null ? "never" : time(j.lastOkAt)}`,
      );
    }
    out.push(
      `budget: ${heartbeat.tokensLastMinute} tokens in the last minute of the share's ${COLLECTOR_SHARE}; peak ${heartbeat.rest.peakMinute ?? "-"} a minute, ${heartbeat.rest.peakBurst ?? "-"} in 5 s`,
    );
    out.push(`replies: ${list(heartbeat.rest)}`);
    out.push(`streams: ${list(heartbeat.streams)}`);
    out.push(`files: ${list(heartbeat.files)}`);
    out.push(`database: ${list(heartbeat.db)}`);
    out.push(
      `price audit: ${heartbeat.audit === null ? "none yet" : list(heartbeat.audit)}`,
    );
    const clock = heartbeat.clock;
    out.push(
      clock === null
        ? "clock: no minute of books yet"
        : `clock: ${clock.minOffsetMs > CLOCK_WATCH_MS ? "WATCH" : "ok"} - the books' smallest receive - ts ${clock.minOffsetMs} ms in the minute from ${time(clock.minuteStart)}`,
    );
    for (const [name, d] of Object.entries(heartbeat.disk)) {
      out.push(
        `disk ${name}: ${d.state === "ok" ? "ok" : d.state.toUpperCase()} - ${d.path} ${d.freeGiB} GiB free`,
      );
    }
  }
  out.push(`backup: ${backup ?? "none yet"}`);
  const kinds = new Map<
    string,
    { files: number; open: number; bytes: number }
  >();
  for (const f of day.files) {
    const kind = /^([a-z]+)-\d\d\.jsonl(\.br)?$/.exec(f.name)?.[1];
    if (kind === undefined) continue;
    const k = kinds.get(kind) ?? { files: 0, open: 0, bytes: 0 };
    k.files += 1;
    if (!f.name.endsWith(".br")) k.open += 1;
    k.bytes += f.bytes;
    kinds.set(kind, k);
  }
  for (const [kind, k] of kinds) {
    out.push(
      `day ${day.date} ${kind}: ${k.files} file(s), ${k.open} plain, ${(k.bytes / 1e6).toFixed(1)} MB`,
    );
  }
  const events = new Map<string, number>();
  for (const c of day.coverage)
    events.set(c.event, (events.get(c.event) ?? 0) + 1);
  out.push(
    `day ${day.date} coverage: ${events.size === 0 ? "no event" : [...events].map(([e, n]) => `${e} ${n}`).join(", ")}${day.unreadableCoverage > 0 ? `; ${day.unreadableCoverage} unreadable line(s)` : ""}`,
  );
  const start = day.coverage.filter((c) => c.event === "process_start").at(-1);
  if (start !== undefined) {
    const gap =
      start.lastHeartbeatAt == null
        ? "no earlier heartbeat"
        : `${age(start.at - start.lastHeartbeatAt)} after the last heartbeat`;
    out.push(`day ${day.date} last start: ${time(start.at)}, ${gap}`);
  }
  out.push(
    `day ${day.yesterday.date}: ${day.yesterday.manifestFiles === null ? "no manifest yet" : `manifest of ${day.yesterday.manifestFiles} file(s)`}`,
  );
  return out;
}

/** The heartbeat file parsed, with its age; null when missing or unreadable. */
export function readHeartbeat(
  stateDir: string,
  now: number,
): { heartbeat: Heartbeat; ageMs: number } | null {
  const file = path.join(stateDir, HEARTBEAT_FILE);
  try {
    const parsed = Heartbeat.safeParse(JSON.parse(readFileSync(file, "utf8")));
    return parsed.success
      ? { heartbeat: parsed.data, ageMs: now - statSync(file).mtimeMs }
      : null;
  } catch {
    return null;
  }
}

/** Today's file names and sizes, its coverage events, and whether yesterday has its manifest. */
export function readDayFacts(root: string, now: number): DayFacts {
  const date = utcDate(now);
  const dir = path.join(root, date);
  const files = existsSync(dir)
    ? readdirSync(dir).map((name) => ({
        name,
        bytes: statSync(path.join(dir, name)).size,
      }))
    : [];
  const coverage: CoverageLine[] = [];
  let unreadableCoverage = 0;
  const coverageFile = path.join(dir, "coverage.jsonl");
  if (existsSync(coverageFile)) {
    for (const line of readFileSync(coverageFile, "utf8").split("\n")) {
      if (line === "") continue;
      const tab = line.indexOf("\t");
      try {
        const e = CoverageEvent.parse(JSON.parse(line.slice(tab + 1)));
        coverage.push({
          at: Number(line.slice(0, tab)),
          event: e.event,
          lastHeartbeatAt: e.lastHeartbeatAt,
        });
      } catch {
        unreadableCoverage += 1;
      }
    }
  }
  const yesterday = utcDate(now - DAY_MS);
  const manifest = path.join(root, yesterday, "manifest.json");
  let manifestFiles: number | null;
  try {
    manifestFiles = Manifest.parse(JSON.parse(readFileSync(manifest, "utf8")))
      .files.length;
  } catch {
    manifestFiles = null;
  }
  return {
    date,
    files,
    coverage,
    unreadableCoverage,
    yesterday: { date: yesterday, manifestFiles },
  };
}

/** The last line of `<STATE_DIR>/backup.log` (part 6 writes it), or null. */
export function readBackupLine(stateDir: string): string | null {
  try {
    const lines = readFileSync(path.join(stateDir, "backup.log"), "utf8")
      .trim()
      .split("\n");
    return lines.at(-1) ?? null;
  } catch {
    return null;
  }
}
