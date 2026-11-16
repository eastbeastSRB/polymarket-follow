/**
 * WAVE-H's program (rules.md; the plan's section 4), run by hand from the
 * repository's build, one run at a time, at idle priority:
 *
 *   node --max-old-space-size=4096 dist/waveh.js rehearse
 *   node --max-old-space-size=4096 dist/waveh.js look
 *
 * `rehearse`: the rehearsal on SIZING with the gate closed (rehearse.ts),
 * the download's manifest as the list. `look`: the one look (look.ts, H15),
 * only once WAVE-H's freeze verifies, `waveh/data.sha256` as the list. It
 * makes no request to any API. Settings, no defaults: WAVEH_STORE and
 * WAVEH_ROOT. Exit codes: 0 done, 1 a crash, 2 bad settings, 4 frozen files
 * differ, 5 not ready (book files needed, a store file missing or failing)
 * or already run.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { createLog } from "./log.js";
import { loadResearch } from "./paper/research.js";
import { WAVEH_DIR, loadCoins } from "./waveh/coins.js";
import { PACKAGE_ROOT, gateOf, verifyFreeze } from "./waveh/gate.js";
import { BooksNeeded, type Ctx } from "./waveh/legs.js";
import { AlreadyRun, FrozenDiffer, loadSizing, look } from "./waveh/look.js";
import { rehearse } from "./waveh/rehearse.js";
import { Settings, sharedHashes, windowEnd } from "./waveh/run.js";
import {
  StoreError,
  manifestList,
  readDataList,
  type DataList,
} from "./waveh/store.js";

function refuse(why: string): never {
  process.stderr.write(`waveh: refused: ${why}\n`);
  process.exit(2);
}
const parsed = Settings.safeParse(process.env);
if (!parsed.success)
  refuse(
    parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; "),
  );
const settings: Settings = parsed.data;
const args = z
  .tuple([z.enum(["rehearse", "look"])])
  .safeParse(process.argv.slice(2));
if (!args.success)
  refuse(`the command: ${args.error.issues.map((i) => i.message).join("; ")}`);
const [command] = args.data;

os.setPriority(os.constants.priority.PRIORITY_LOW);
const { log, close } = createLog(settings.WAVEH_ROOT, "waveh");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ctxOf = async (list: DataList): Promise<Ctx> => ({
  store: settings.WAVEH_STORE,
  list,
  coins: loadCoins(),
  kit: await loadResearch(),
  pace: async () => {
    for (
      let end = windowEnd(Date.now());
      end !== null;
      end = windowEnd(Date.now())
    ) {
      log.info({ until: new Date(end).toISOString() }, "a window: waiting");
      await sleep(Math.min(60_000, end - Date.now() + 1_000));
    }
  },
  log: (event, fields) => log.info(fields, event),
});
let code = 0;
try {
  log.info(
    { node: process.version, shared: sharedHashes(PACKAGE_ROOT) },
    `start ${command}`,
  );
  if (command === "rehearse") {
    const sizing = await rehearse(
      await ctxOf(
        manifestList(
          readFileSync(
            path.join(settings.WAVEH_STORE, "manifest.jsonl"),
            "utf8",
          ),
        ),
      ),
      settings.WAVEH_ROOT,
    );
    log.info({ M: sizing.M, outcomes: sizing.outcomes }, "done");
  } else {
    const freeze = verifyFreeze(PACKAGE_ROOT);
    if (!freeze.ok)
      throw new FrozenDiffer(
        `${freeze.problems.length}: ${freeze.problems.slice(0, 10).join("; ")}`,
      );
    log.info({ freeze: freeze.sha256, files: freeze.files }, "frozen");
    const data = readFileSync(path.join(WAVEH_DIR, "data.sha256"));
    await look(
      await ctxOf(readDataList(data.toString("utf8"))),
      gateOf(freeze),
      settings.WAVEH_ROOT,
      loadSizing(),
      createHash("sha256").update(data).digest("hex"),
    );
  }
} catch (err) {
  if (err instanceof FrozenDiffer) {
    log.warn({ why: err.message }, "frozen files differ");
    code = 4;
  } else if (
    err instanceof BooksNeeded ||
    err instanceof StoreError ||
    err instanceof AlreadyRun
  ) {
    log.warn(
      { why: err.message },
      err instanceof BooksNeeded
        ? "books needed"
        : err instanceof AlreadyRun
          ? "already run"
          : "not ready",
    );
    code = 5;
  } else {
    log.error({ err: String((err as Error)?.stack ?? err) }, "crash");
    code = 1;
  }
} finally {
  close();
}
process.exit(code);
