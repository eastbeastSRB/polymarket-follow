import type { Logger } from "../log.js";
import {
  inNightlyPause,
  nextNightlyEdge,
  nextRun,
  type Schedule,
} from "../schedule.js";
import type { Recorder } from "../store/files.js";

/**
 * `run` resolves true when the job did its work (its read answered and
 * passed its schema). `catchUpMs`: a start runs the job at once only within
 * this long after a slot (0: never at start, only on the schedule); without
 * it, every start runs it.
 */
export type Job = {
  name: string;
  schedule: Schedule;
  run: () => Promise<boolean>;
  catchUpMs?: number;
};

export type JobStatus = { lastRunAt: number | null; lastOkAt: number | null };

/** Whether a start at `now` runs the job at once. */
export function runsAtStart(job: Job, now: number): boolean {
  if (job.catchUpMs === undefined) return true;
  const lastSlot = nextRun(job.schedule, now) - job.schedule.everyMs;
  return now - lastSlot < job.catchUpMs;
}

/**
 * Each job at start (see `runsAtStart`), then on its schedule; a tick that
 * finds the previous run still going is skipped, never stacked.
 */
export function startJobs(
  jobs: readonly Job[],
  log: Logger,
): { stop: () => void; status: () => Record<string, JobStatus> } {
  const timers: NodeJS.Timeout[] = [];
  const status: Record<string, JobStatus> = {};
  jobs.forEach((job, slot) => {
    let running = false;
    const state: JobStatus = { lastRunAt: null, lastOkAt: null };
    status[job.name] = state;
    const tick = (dueAt: number, skip = false) => {
      const next = nextRun(job.schedule, Math.max(dueAt, Date.now()));
      timers[slot] = setTimeout(() => tick(next), next - Date.now());
      if (running || skip) return;
      running = true;
      state.lastRunAt = Date.now();
      job
        .run()
        .then((ok) => {
          if (ok) state.lastOkAt = Date.now();
        })
        .catch((err: unknown) =>
          log.error({ err, job: job.name }, "job failed"),
        )
        .finally(() => {
          running = false;
        });
    };
    tick(Date.now(), !runsAtStart(job, Date.now()));
  });
  return {
    stop: () => timers.forEach((t) => clearTimeout(t)),
    status: () => structuredClone(status),
  };
}

/** A coverage mark at each start and end of the nightly window, and at start if inside it. */
export function startPauseMarks(
  recorder: Pick<Recorder, "coverage">,
): () => void {
  let timer: NodeJS.Timeout | undefined;
  if (inNightlyPause(Date.now()))
    recorder.coverage({ event: "rest_pause", state: "start" });
  const arm = () => {
    const edge = nextNightlyEdge(Date.now());
    timer = setTimeout(() => {
      recorder.coverage({
        event: "rest_pause",
        state: edge.starts ? "start" : "end",
      });
      arm();
    }, edge.at - Date.now());
  };
  arm();
  return () => clearTimeout(timer);
}
