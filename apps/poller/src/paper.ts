/**
 * The paper experiment's program (the plan's section 6; decisions
 * 2026-11-12, "the paper experiment's plan approved"), run from the run
 * copy's folder by its Windows task every day at 04:00Z (registered by
 * tools/register-tasks.ps1):
 *
 *   node dist/paper.js daily                  the day's reads, copies, log and page
 *   node dist/paper.js look <1|2|3>           a look, once, after its Monday's run
 *   node dist/paper.js reparse "<decisions entry>"   holes of rejected rows, after a recorded fix
 *
 * Exit codes: 0 done (also a run ended by the night pause: the next one
 * continues), 1 a crash, 2 a bad configuration, 3 another run holds the
 * lock, 4 frozen files differ, 5 a look not due, not ready or already run.
 */
import path from "node:path";
import { z } from "zod";
import { daily } from "./paper/daily.js";
import { look } from "./paper/look.js";
import { reparseHoles } from "./paper/reparse.js";
import { loadPaperConfig, openRun } from "./paper/run.js";
import { PaperStore } from "./paper/store.js";

const Settings = z.object({
  MONGO_URI: z.string().trim().startsWith("mongodb://"),
  MONGO_DB: z
    .literal("polymarket_follow")
    .or(z.literal("polymarket_follow_test")),
});

const Command = z.union([
  z.tuple([z.literal("daily")]),
  z.tuple([z.literal("look"), z.enum(["1", "2", "3"])]),
  z.tuple([z.literal("reparse"), z.string().min(10)]),
]);

let config: ReturnType<typeof loadPaperConfig> & z.infer<typeof Settings>;
let command: z.infer<typeof Command>;
try {
  const base = loadPaperConfig();
  config = { ...base, ...Settings.parse(process.env) };
  command = Command.parse(process.argv.slice(2));
} catch (err) {
  process.stderr.write(`paper: refused: ${String(err)}\n`);
  process.exit(2);
}

const run = openRun(config.STATE_DIR);
process.on("uncaughtException", (err) => crash(err));
process.on("unhandledRejection", (err) => crash(err));
function crash(err: unknown): never {
  run.log.fatal({ err }, "paper run crashed");
  process.exit(1);
}
if (!run.taken) {
  run.log.warn(
    { holderPid: run.holderPid },
    "another paper run holds the lock; exiting",
  );
  run.close();
  process.exit(3);
}

let exit: number;
run.log.info({ command }, "paper run started");
if (command[0] === "daily") {
  exit = await daily(config, run.log, run.stage);
} else if (command[0] === "look") {
  exit = await look(config, run.log, Number(command[1]) as 1 | 2 | 3);
} else {
  const store = new PaperStore(config.PAPER_ROOT);
  const state = store.readState();
  const done = reparseHoles(store, path.join(config.PAPER_ROOT, "raw"), state);
  run.log.info(
    { ...done, decision: command[1] },
    "holes of rejected rows re-parsed",
  );
  exit = 0;
}
run.log.info({ command, exit }, "paper run ended");
run.close();
process.exit(exit);
