/**
 * MARKET-1's program (rules.md; the plan's section 5), run from its run
 * copy's folder by its Windows task every day at 10:30Z (registered by
 * tools/register-tasks.ps1 -Market1Only):
 *
 *   node dist/market1.js daily          the day's positions, record and page
 *   node dist/market1.js look <1|2|3>   a look, once, after its Monday
 *
 * It makes no request to any API. Exit codes: 0 done, 1 a crash, 2 a bad
 * configuration, 3 another run holds the lock, 4 frozen files differ, 5 a
 * look not due, not ready or already run, or the paper experiment's run
 * still live after 6 hours.
 */
import { z } from "zod";
import { daily } from "./market1/daily.js";
import { look } from "./market1/look.js";
import {
  loadMarket1Config,
  openRun,
  type Market1Config,
} from "./market1/run.js";

const Command = z.union([
  z.tuple([z.literal("daily")]),
  z.tuple([z.literal("look"), z.enum(["1", "2", "3"])]),
]);

let config: Market1Config;
let command: z.infer<typeof Command>;
try {
  config = loadMarket1Config();
  command = Command.parse(process.argv.slice(2));
} catch (err) {
  process.stderr.write(`market1: refused: ${String(err)}\n`);
  process.exit(2);
}

const run = openRun(config.STATE_DIR);
process.on("uncaughtException", (err) => crash(err));
process.on("unhandledRejection", (err) => crash(err));
function crash(err: unknown): never {
  run.log.fatal({ err }, "market1 run crashed");
  process.exit(1);
}
if (!run.taken) {
  run.log.warn(
    { holderPid: run.holderPid },
    "another market1 run holds the lock; exiting",
  );
  run.close();
  process.exit(3);
}

run.log.info({ command }, "market1 run started");
const exit =
  command[0] === "daily"
    ? await daily(config, run.log, run.stage)
    : await look(config, run.log, Number(command[1]) as 1 | 2 | 3);
run.log.info({ command, exit }, "market1 run ended");
run.close();
process.exit(exit);
