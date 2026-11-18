/**
 * The polishing's program (the polishing plan 4.6; decisions 2026-11-17,
 * the plan approved), run by hand from the repository's build, one run at a
 * time, at idle priority; it makes no request to any API:
 *
 *   node dist/polish.js extract [--workers n] [--day YYYY-MM-DD]
 *   node dist/polish.js gates
 *   node dist/polish.js explore
 *
 * This file only starts the program (`polish/main.js`, which has the
 * commands, settings and exit codes) in a worker thread whose heap ceiling
 * is 20 GB; each worker of its pass has 4 GB (F3). Every ceiling is a
 * worker's own, and V8's heap flag beats them all, so a heap flag on the
 * command line or in NODE_OPTIONS is refused, exit 2 (decisions 2026-11-18,
 * EXTRACT-REVIEW's findings, L5). The program's exit is the process's; a
 * program that dies uncaught (its ceiling reached among them) exits 1.
 */
import { Worker } from "node:worker_threads";

/** The program's old-generation ceiling: 20 GB, F3's for the exam (decisions 2026-11-18, EXTRACT-FIX verified, 1: G6 alone held 8.9 GB of heap on 2025-10-10). */
const PROGRAM_HEAP_MB = 20_480;
const HEAP_FLAG = /^--max[-_](?:old[-_]space|heap)[-_]size/;

const flags = [
  ...process.execArgv,
  ...(process.env.NODE_OPTIONS ?? "").split(/\s+/),
].filter((a) => HEAP_FLAG.test(a));
if (flags.length > 0) {
  process.stderr.write(
    `polish: refused: ${flags.join(" ")}: a heap flag overrides every worker's ceiling (the program's 20 GB, a pass worker's 4 GB); run node dist/polish.js without one\n`,
  );
  process.exit(2);
}
const program = new Worker(new URL("./polish/main.js", import.meta.url), {
  argv: process.argv.slice(2),
  resourceLimits: { maxOldGenerationSizeMb: PROGRAM_HEAP_MB },
});
program.on("error", (err: Error) => {
  process.stderr.write(`polish: crash: ${err.stack ?? String(err)}\n`);
  process.exitCode = 1;
});
program.on("exit", (code) => process.exit(process.exitCode ?? code));
