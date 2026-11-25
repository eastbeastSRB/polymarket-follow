/**
 * COPY-H's numbers (rules.md C18 against src/copyh/design.ts): every row of
 * the table read from the rules file and held to the code's value, and every
 * row named here present in the table, so that neither can change alone. A
 * value still marked to be set before the freeze holds the code at its
 * provisional value until the table gives the number.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as D from "../src/copyh/design.js";
import { PACKAGE_ROOT } from "../src/copyh/run.js";

const MARKER = "[SET BEFORE THE FREEZE";
const hhmm = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
const iso = (t: number) => new Date(t).toISOString();

/** Each row of C18 as the code gives it: its values in the table's order. */
const ROWS: Record<string, readonly (number | string)[] | null> = {
  ARCHIVE_START: [iso(D.ARCHIVE_START)],
  M0: [iso(D.M0)],
  END_E: [iso(D.END_E)],
  END_S: [iso(D.END_S)],
  END_F2: [iso(D.END_F2)],
  "funding from": [iso(D.FUNDING_FROM)],
  "switch hour": [iso(D.SWITCH_HOUR)],
  "record failure limit": [D.FAIL_SHARE, D.FAIL_LEAST],
  "exact digits of sz and startPosition": [D.EXACT_DIGITS],
  buckets: [D.BUCKETS],
  "hole seconds": [D.HOLE_MS / 1000],
  "merge ms": [D.MERGE_MS],
  EXITS_MAX: [D.EXITS_MAX],
  "float residue bounds": D.RESIDUE_BOUNDS,
  "label capture days": [D.LABEL_CAPTURE_DAYS],
  "main hold hours, closed cycles": [D.MAIN_HOLD_HOURS, D.MAIN_CLOSED_CYCLES],
  "ten closed cycles": [D.TEN_CLOSED_CYCLES],
  "day hold hours": [D.DAY_HOLD_HOURS],
  stops: D.STOPS,
  "days7 days": [D.DAYS7_DAYS],
  jump: [D.JUMP],
  "delay lines minutes": D.DELAY_LINES_MINUTES,
  "rank weeks, min copies, share": [
    D.RANK_WEEKS,
    D.RANK_MIN_COPIES,
    D.RANK_SHARE,
  ],
  slices: [D.SLICES],
  "fee a leg": [D.FEE_A_LEG],
  "venue fee a side, Binance": [D.BINANCE_FEE_A_SIDE],
  "pair max ms": [D.PAIR_MS],
  "spread min minutes": [D.SPREAD_MIN_MINUTES],
  "spread fallback": [D.SPREAD_FALLBACK],
  "settlement mark minutes":
    D.SETTLEMENT_MARK_MINUTES === null ? null : [D.SETTLEMENT_MARK_MINUTES],
  "settlement mark switch": [D.SETTLEMENT_MARK_SWITCH],
  "thin leg notional, minutes": [D.THIN_NOTIONAL, D.THIN_MINUTES],
  "d horizon hours": [D.D_HORIZON_HOURS],
  "withheld share": [D.WITHHELD_SHARE],
  "delta bps": [D.DELTA_BPS],
  "z looks": D.Z_LOOKS,
  "smallest edge": D.SMALLEST_EDGE,
  "concentration best days, top traders' share, top traders": [
    D.CONCENTRATION.bestDays,
    D.CONCENTRATION.topShare,
    D.CONCENTRATION.topTraders,
  ],
  rounds: [D.ROUNDS],
  "tries a round": D.TRIES_A_ROUND,
  "z choice": [D.Z_CHOICE],
  "choice min traders, days": [D.CHOICE_MIN_TRADERS, D.CHOICE_MIN_DAYS],
  "choice best days left out": [D.CHOICE_BEST_DAYS_LEFT_OUT],
  "chosen at most": [D.CHOSEN_AT_MOST],
  "z confirm": D.Z_CONFIRM,
  "z seal try, main": D.Z_SEAL,
  "FRESH-2 fill files": [D.FRESH2_FILES],
  "tripwire minutes": [D.TRIPWIRE_MINUTES],
  "tripwire stop": [D.TRIPWIRE_STOP],
  "part minutes": [D.PART_MINUTES],
  "closed windows": D.CLOSED_WINDOWS.map(([a, b]) => `${hhmm(a)}-${hhmm(b)}Z`),
  "worker heap": [D.WORKER_HEAP_GB],
  "worker heap cap GB": [D.WORKER_HEAP_CAP_GB],
  "rehearsal window": D.REHEARSAL_WINDOW.map(iso),
  "label check Mondays": D.LABEL_CHECK_MONDAYS,
  "label check slice": D.LABEL_CHECK_SLICE,
  "label check pass mark": [D.LABEL_CHECK_PASS],
  reproduction: D.REPRODUCTION,
  "reproduction tolerance bps": [D.REPRODUCTION_TOLERANCE_BPS],
  "sample days, E": D.SAMPLE_DAYS.E,
  "sample days, S": D.SAMPLE_DAYS.S,
};

/** C18's rows: name and value text, as the table writes them. */
function table(): Map<string, string> {
  const text = readFileSync(
    path.join(PACKAGE_ROOT, "copyh", "rules.md"),
    "utf8",
  ).replaceAll("\r\n", "\n");
  const at = text.indexOf("\n## C18. The numbers\n");
  expect(at).toBeGreaterThan(0);
  const rows = new Map<string, string>();
  // The lines after the section's heading, to the next section.
  for (const line of text
    .slice(at + 1)
    .split("\n")
    .slice(1)) {
    if (line.startsWith("## ")) break;
    const m = /^\| (.+?) \| (.+) \|$/.exec(line);
    if (m === null || m[1] === "Name" || /^-+$/.test(m[1]!)) continue;
    rows.set(m[1]!, m[2]!);
  }
  return rows;
}

/** A table value's tokens: numbers as numbers, everything else as written. */
const tokens = (value: string) =>
  value.split(" ").map((t) => (/^-?[\d.]+(e-?\d+)?$/.test(t) ? Number(t) : t));

describe("C18, the numbers", () => {
  it("names the same rows as the code", () => {
    expect([...table().keys()].sort()).toEqual(Object.keys(ROWS).sort());
  });

  it("holds every value the table gives to the code's", () => {
    for (const [name, value] of table()) {
      if (value.startsWith(MARKER)) continue;
      expect(ROWS[name], name).not.toBeNull();
      expect(tokens(value), name).toEqual([...ROWS[name]!]);
    }
  });

  it("keeps a value marked to be set before the freeze at its provisional one", () => {
    const rows = table();
    expect(rows.get("settlement mark minutes")!.startsWith(MARKER)).toBe(
      D.SETTLEMENT_MARK_MINUTES === null,
    );
    // Until the rehearsal, three times the synthetic peaks (D10): a whole number under the cap.
    expect(Number.isInteger(D.WORKER_HEAP_GB)).toBe(true);
    expect(D.WORKER_HEAP_GB).toBeGreaterThan(0);
    expect(D.WORKER_HEAP_GB).toBeLessThanOrEqual(D.WORKER_HEAP_CAP_GB);
  });
});
