/**
 * COPY-H's program (copyh/rules.md C15), run by hand from the repository's
 * build, one command at a time, at idle priority; it makes no request to any
 * API (its commands: copyh/main.ts):
 *
 *   node dist/copyh.js coins | count | build | step1 | tries | choice | step2 | fresh2
 *
 * This file only starts the program (`copyh/main.js`) in a worker thread
 * whose heap ceiling is design.ts's WORKER_HEAP_GB, or the larger whole
 * number COPYH_HEAP_GB gives when a decisions entry names it (RH1 (c)); each
 * worker of its pass has the same. Every ceiling is a worker's own, and V8's
 * heap flag beats them all, so a heap flag on the command line or in
 * NODE_OPTIONS is refused, exit 2, as a COPYH_HEAP_GB of another form is
 * (the analyzer's launcher, decisions 2026-11-18, EXTRACT-REVIEW's L5). The
 * program's exit is the process's; a program that dies uncaught (its
 * ceiling reached among them) exits 1.
 */
import { Worker } from "node:worker_threads";
import { heapOf } from "./copyh/run.js";

const HEAP_FLAG = /^--max[-_](?:old[-_]space|heap)[-_]size/;

const refuse = (why: string): never => {
  process.stderr.write(`copyh: refused: ${why}\n`);
  process.exit(2);
};
const flags = [
  ...process.execArgv,
  ...(process.env.NODE_OPTIONS ?? "").split(/\s+/),
].filter((a) => HEAP_FLAG.test(a));
if (flags.length > 0)
  refuse(
    `${flags.join(" ")}: a heap flag overrides every worker's ceiling; run node dist/copyh.js without one (COPYH_HEAP_GB raises the ceiling when a decisions entry names it)`,
  );
const heap = heapOf(process.env.COPYH_HEAP_GB);
const heapGb: number = typeof heap === "string" ? refuse(heap) : heap;
const program = new Worker(new URL("./copyh/main.js", import.meta.url), {
  argv: process.argv.slice(2),
  resourceLimits: { maxOldGenerationSizeMb: heapGb * 1024 },
});
program.on("error", (err: Error) => {
  process.stderr.write(`copyh: crash: ${err.stack ?? String(err)}\n`);
  process.exitCode = 1;
});
program.on("exit", (code) => process.exit(process.exitCode ?? code));
