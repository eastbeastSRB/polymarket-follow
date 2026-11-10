import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import type { Logger } from "../log.js";
import type { Recorder } from "../store/files.js";

/**
 * Files in the state folder that make the running poller fail on purpose, so
 * a check can be seen to work on the live path: each is deleted when used.
 */
export function watchTestSwitches(
  stateDir: string,
  switches: Record<string, () => void>,
  recorder: Pick<Recorder, "coverage">,
  log: Logger,
): () => void {
  const timer = setInterval(() => {
    for (const [name, act] of Object.entries(switches)) {
      const file = path.join(stateDir, name);
      try {
        if (!existsSync(file)) continue;
        rmSync(file, { force: true });
      } catch (err) {
        log.warn({ err, name }, "test switch not read");
        continue;
      }
      log.warn({ name }, "test switch used");
      recorder.coverage({ event: "test_switch", name });
      act();
    }
  }, 5_000);
  timer.unref();
  return () => clearInterval(timer);
}
