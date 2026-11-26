/** A child process of the engine (engine.ts): the kit loaded once, then one part at a time on the parent's messages, each written whole and answered; it says it is ready first, so that no message comes before its listener. It never logs. */
import { loadResearch } from "../paper/research.js";
import { runJob, type Job } from "./engine.js";

const kit = loadResearch();
// A kit that fails to load fails each job, never the child before its first.
kit.catch(() => undefined);
process.on("message", (job: Job) => {
  void runJob(job, kit).then((reply) => process.send!(reply));
});
process.send!({ ready: true });
