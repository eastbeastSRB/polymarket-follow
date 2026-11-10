import type { Logger } from "../log.js";
import {
  inNightlyPause,
  nextNightlyEdge,
  nextRun,
  type Schedule,
} from "../schedule.js";
import type { Recorder } from "../store/files.js";

export type Job = {
  name: string;
  schedule: Schedule;
  run: () => Promise<void>;
};

/**
 * Each job once at start, then on its schedule; a tick that finds the
 * previous run still going is skipped, never stacked.
 */
export function startJobs(jobs: readonly Job[], log: Logger): () => void {
  const timers: NodeJS.Timeout[] = [];
  jobs.forEach((job, slot) => {
    let running = false;
    const tick = (dueAt: number) => {
      const next = nextRun(job.schedule, Math.max(dueAt, Date.now()));
      timers[slot] = setTimeout(() => tick(next), next - Date.now());
      if (running) return;
      running = true;
      job
        .run()
        .catch((err: unknown) =>
          log.error({ err, job: job.name }, "job failed"),
        )
        .finally(() => {
          running = false;
        });
    };
    tick(Date.now());
  });
  return () => timers.forEach((t) => clearTimeout(t));
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
