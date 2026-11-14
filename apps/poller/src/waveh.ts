/**
 * WAVE-H's program (rules.md; the plan's section 4), run by hand from the
 * repository's build, one run at a time, at idle priority:
 *
 *   node --max-old-space-size=4096 dist/waveh.js rehearse
 *
 * the rehearsal on SIZING with the gate closed (rehearse.ts). It makes no
 * request to any API. Settings, no defaults: WAVEH_STORE and WAVEH_ROOT.
 * Exit codes: 0 done, 1 a crash, 2 bad settings, 5 not ready (book files
 * needed, a store file missing or failing).
 */
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { createLog } from "./log.js";
import { loadResearch } from "./paper/research.js";
import { loadCoins } from "./waveh/coins.js";
import { PACKAGE_ROOT } from "./waveh/gate.js";
import { BooksNeeded, rehearse } from "./waveh/rehearse.js";
import { Settings, sharedHashes, windowEnd } from "./waveh/run.js";
import { StoreError, manifestList } from "./waveh/store.js";

let settings: Settings;
try {
  settings = Settings.parse(process.env);
  z.tuple([z.literal("rehearse")]).parse(process.argv.slice(2));
} catch (err) {
  process.stderr.write(
    `waveh: refused: ${err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".") || "the command"}: ${i.message}`).join("; ") : String(err)}\n`,
  );
  process.exit(2);
}

os.setPriority(os.constants.priority.PRIORITY_LOW);
const { log, close } = createLog(settings.WAVEH_ROOT, "waveh");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let code = 0;
try {
  log.info(
    { node: process.version, shared: sharedHashes(PACKAGE_ROOT) },
    "start rehearse",
  );
  const sizing = await rehearse(
    {
      store: settings.WAVEH_STORE,
      list: manifestList(
        readFileSync(path.join(settings.WAVEH_STORE, "manifest.jsonl"), "utf8"),
      ),
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
    },
    settings.WAVEH_ROOT,
  );
  log.info({ M: sizing.M, outcomes: sizing.outcomes }, "done");
} catch (err) {
  if (err instanceof BooksNeeded || err instanceof StoreError) {
    log.warn(
      { why: err.message },
      err instanceof BooksNeeded
        ? "books needed"
        : "a store file missing or failing",
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
