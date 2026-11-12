/**
 * Closing the holes rejected rows made (PAPER-PLAN-REVIEW F3 (b)): after a
 * code-defect fix recorded in decisions (the plan's R0), the raw replies of
 * each such hole's read — kept by the Recorder in `raw\<UTC date>\rest-HH`
 * — are parsed again by the fixed code. A hole whose rows now all pass is
 * closed and its rows stored; one with a row still failing stays. The page
 * cap's and the safety cap's holes stay as written.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { DAY_MS, utcDate } from "../schedule.js";
import { FillRow, FillsPage, keepIdDigits } from "./routes.js";
import type { PaperStore, State, StoredRow } from "./store.js";

/** The bodies of the fills replies an account received on `dates` (HTTP 200, passed the page's check). */
export function keptFillsReplies(
  rawRoot: string,
  dates: readonly string[],
  address: string,
): unknown[][] {
  const pages: unknown[][] = [];
  for (const date of dates) {
    const dir = path.join(rawRoot, date);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir).sort()) {
      if (!/^rest-\d\d\.jsonl(\.br)?$/.test(name)) continue;
      const bytes = readFileSync(path.join(dir, name));
      const text = (
        name.endsWith(".br") ? brotliDecompressSync(bytes) : bytes
      ).toString("utf8");
      for (const line of text.split("\n")) {
        const first = line.indexOf("\t");
        const second = line.indexOf("\t", first + 1);
        if (first < 0 || second < 0) continue;
        const meta = JSON.parse(line.slice(first + 1, second)) as {
          path?: unknown;
          status?: unknown;
        };
        if (meta.status !== 200 || typeof meta.path !== "string") continue;
        const url = new URL(meta.path, "https://x");
        if (url.pathname !== "/v1/info/fills") continue;
        if (url.searchParams.get("address") !== address) continue;
        let body = line.slice(second + 1);
        if (body.startsWith('"')) body = JSON.parse(body) as string;
        const page = FillsPage.safeParse(JSON.parse(body, keepIdDigits));
        if (page.success) pages.push(page.data.data);
      }
    }
  }
  return pages;
}

export function reparseHoles(
  store: PaperStore,
  rawRoot: string,
  state: State,
): { closed: number; still: number; rows: number } {
  let closed = 0;
  let still = 0;
  let rows = 0;
  for (const [addr, account] of Object.entries(state.accounts)) {
    const keep = [];
    for (const hole of account.holes) {
      if (hole.cause !== "rejected rows") {
        keep.push(hole);
        continue;
      }
      // A run that began on `readOn` can go on into the next days.
      const day = Date.parse(`${hole.readOn}T00:00:00Z`);
      const dates = [0, 1, 2].map((k) => utcDate(day + k * DAY_MS));
      const found: StoredRow[] = [];
      let failing = 0;
      for (const page of keptFillsReplies(rawRoot, dates, addr)) {
        for (const raw of page) {
          const t = (raw as { timestamp?: unknown } | null)?.timestamp;
          const row = FillRow.safeParse(raw);
          // A row with no instant could lie in any hole of its read: it keeps them all.
          if (typeof t !== "number") {
            if (!row.success) failing += 1;
            continue;
          }
          if (t < hole.from || t >= hole.to) continue;
          if (row.success) found.push(row.data);
          else failing += 1;
        }
      }
      if (failing > 0) {
        still += 1;
        keep.push(hole);
        continue;
      }
      rows += store.addRows(addr, found);
      closed += 1;
    }
    account.holes = keep;
  }
  if (closed > 0) store.saveState(state);
  return { closed, still, rows };
}
