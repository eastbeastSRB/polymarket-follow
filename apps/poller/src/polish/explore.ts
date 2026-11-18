/**
 * `polish explore`, its frame (the polishing plan 1 and 4.6; decisions
 * 2026-11-17, the plan approved, Q6): the store is opened only when it is
 * trusted (its `gates\gates.json` passed, on this very manifest), then its
 * counted fills are loaded through the gates' library and the store's
 * identity and counts are printed. No try is defined yet: B0, the parts E
 * and C, the try log and every try are POLISH-EXPLORE's. It writes nothing.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Coins } from "../waveh/coins.js";
import { StoreError } from "../waveh/store.js";
import { countedFrom } from "./counted.js";
import { STORE } from "./extract.js";
import { GATES, GATES_FILE, GatesFile } from "./gates.js";
import { openStore, type Store } from "./store.js";

/** The store under `root` (the analyzer's folder of the range), a whole range's; a timing run's is not ready. */
export function wholeStore(root: string): Store {
  const store = openStore(path.join(root, STORE));
  if (store.manifest.partial !== null)
    throw new StoreError(
      `the store is a timing run's (${store.manifest.partial})`,
    );
  return store;
}

/** The whole store under `root`, its gates passed on its manifest; else not ready. */
export function trustedStore(root: string): Store {
  const store = wholeStore(root);
  let text: string;
  try {
    text = readFileSync(path.join(root, GATES, GATES_FILE), "utf8");
  } catch {
    throw new StoreError(`no ${GATES}\\${GATES_FILE}: run gates first`);
  }
  const gates = GatesFile.parse(JSON.parse(text));
  if (gates.store.manifestSha256 !== store.id)
    throw new StoreError(`${GATES_FILE} is of another store`);
  if (!gates.passed)
    throw new StoreError(`the store's gates did not pass (${GATES_FILE})`);
  return store;
}

/** The frame: the trusted store's identity and counts, its counted fills loaded; no try. */
export function explore(store: Store, coins: Coins) {
  const m = store.manifest;
  const set = countedFrom(store, coins);
  return {
    store: {
      manifestSha256: store.id,
      range: m.range,
      written: m.written,
      code: m.code.fingerprint,
    },
    counts: {
      users: m.dict.users.count,
      partitions: m.partitions.length,
      rows: m.counts.merge,
      counted: set.counted.length,
      sizing: set.sizing.length,
    },
    tries: "no try is defined",
  };
}
