/**
 * The vendored research files (decisions 2026-11-12, "the paper experiment's
 * plan approved", Q4): RESEARCH-KIT's kit and FIND-6-EXITS's library, byte
 * for byte in `apps/poller/research/`, frozen JavaScript loaded at run time by
 * path and typed here. Every load checks them first: the kit's own
 * `checkKit()` must return the pinned fingerprint (it also refuses a changed,
 * missing or extra file) and lib-exits its pinned hash.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const KIT_FINGERPRINT =
  "2d3667b5ce90645b41dfee4e6fc425ab3e64c985cb4973bfed6ece5052c409aa";
export const LIB_EXITS_SHA256 =
  "612d58365ba4c2a2d88a3f73a41a08e193d0874458d862b169fc51f218926330";

/** `research/` beside `src/` (vitest) and beside `dist/` (the build, the run copy). */
export const RESEARCH_ROOT = fileURLToPath(
  new URL("../../research/", import.meta.url),
);

/** A normalized fill (the kit's `normFill`); the paper keeps `oid` and `tid` as the reply's digits. */
export type Fill = {
  t: number;
  iid: number;
  oid: string | number;
  tid: string | number;
  prevS: string;
  prev: number;
  sgn: 1 | -1;
  px: number;
  q: number;
  fee: number;
  pnl: number;
  taker: boolean;
  liq: boolean;
  forced: boolean;
};

export type EventKind = "OPEN" | "ADD" | "REDUCE" | "CLOSE" | "FLIP";

export type OrderEvent = {
  oid: string | number;
  iid: number;
  t: number;
  t1: number;
  prev: number;
  net: number;
  n: number;
  notional: number;
  forced: boolean;
  liq: boolean;
  tids: (string | number)[];
  after: number;
  kind: EventKind;
  dir: number;
};

export type Cycle = {
  iid: number;
  start: number | null;
  dir: number;
  end: number | null;
  closedBy?: "CLOSE" | "FLIP";
  forced?: boolean;
};

export type GroupExit = {
  t: number;
  share: number;
  kind: EventKind;
  forced: boolean;
};

export type Group = {
  iid: number;
  dir: number;
  type: "OPEN" | "FLIP" | "ADD";
  t: number;
  first: OrderEvent;
  merged: OrderEvent[];
  tids: (string | number)[];
  exits: GroupExit[];
};

/** What `labelAt` reads of an account: its fills and the capture's page facts. */
export type Capture = {
  fills: readonly Fill[];
  pages: number;
  truncated: boolean;
  oldest: number | null;
};

export type Label = {
  label: string;
  horizon: string;
  reason: string;
  covered: boolean;
};

export type Habits = {
  closed: number;
  medianHoldMs: number | null;
  hClass: number;
  entries: number;
  longShare: number | null;
};

/** One market's panel file as `marketFrom` reads it (RESEARCH-KIT §1). */
export type PanelFile = {
  iid: number;
  symbol: string;
  category: string;
  start: number;
  end: number;
  firstTrade: number | null;
  retired: unknown;
  marks: (number | null)[];
  klines: { minute: number[]; trades: number[]; volume: number[] };
  funding: [number, number, number][];
};

export type Market = {
  iid: number;
  symbol: string;
  category: string;
  start: number;
  end: number;
  n: number;
  marks: Float64Array;
  trades: Int32Array;
  volume: Float64Array;
  retired: unknown;
  firstTrade: number | null;
  funding: {
    hour: Float64Array;
    rate: Float64Array;
    cum: Float64Array;
    cumUnmarked: Int32Array;
  };
};

export type Setting = {
  name: string;
  fee: (iid: number, t: number) => number;
  spread: (iid: number, t: number) => { c: number; fallback: boolean };
};

export type LegResult = {
  gross: number;
  net: number;
  fees: number;
  funding: number;
  fundingMissing: number;
  spreadFallback: boolean;
};

export type DResult =
  | {
      d: number;
      gross: number;
      nullGross: number;
      weight: number;
      minutes: number;
    }
  | { d: null; reason: string };

export type Cr1 = {
  estimate: number | null;
  se: number | null;
  t: number | null;
  df: number;
  p: number | null;
  clusters: number;
  n: number;
};

/** A copy's exit (lib-exits' `exitsOf`). */
export type CopyExit = GroupExit & { liq: boolean };

export type CopyLeg = {
  h: number;
  part: number;
  kind: EventKind | "cut";
  forced: boolean;
  liq: boolean;
};

export type CopyPlan = {
  legs: CopyLeg[];
  flag: "open" | "crossing" | null;
  lastExitT: number | null;
};

export type CopyPrice =
  | {
      net: number;
      gross: number;
      fees: number;
      funding: number;
      hold: number;
      fullExit: number;
      fundingMissing: number;
      spreadFallback: boolean;
      reason?: undefined;
    }
  | { reason: string };

export type ChainBreaks = {
  index: Map<OrderEvent, number>;
  breaks: OrderEvent[];
};

/** The kit's and lib-exits' exports the paper uses, as the frozen files define them. */
export type Research = {
  fingerprint: string;
  constants: { CUT: number; MIN: number; HOUR: number; DAY: number };
  fills: {
    normFill: (row: Record<string, unknown>) => Fill;
    validFill: (row: unknown) => boolean;
    readAccount: (
      addr: string,
      roots?: { capture: string; merged: string },
    ) =>
      | (Capture & {
          addr: string;
          path: string;
          folder: string;
          merged: boolean;
          newest: number | null;
          dropped: number;
        })
      | null;
    BlindStoreError: new (message?: string) => Error;
  };
  entries: {
    toEvents: (fills: readonly Fill[]) => OrderEvent[];
    toCycles: (events: readonly OrderEvent[]) => Cycle[];
    buildEntries: (
      events: readonly OrderEvent[],
      from: number,
      to: number,
      mergeMs?: number,
    ) => Group[];
    entryId: (addr: string, g: Group) => string;
    delayOf: (id: string) => number;
    maxDelay: () => number;
    median: (values: readonly number[]) => number | null;
  };
  labels: {
    LABEL_DAYS: number;
    HABIT_DAYS: number;
    labelAt: (account: Capture, at: number) => Label;
    habitsAt: (
      history: { cycles: readonly Cycle[]; groups: readonly Group[] },
      at: number,
    ) => Habits;
    mondays: (from: number, to: number) => number[];
  };
  cells: {
    inPrimaryCell: (iid: number, t: number) => boolean;
    mapOpen: (
      iid: number,
      cell: { h: number; setting: Setting; dir: number },
    ) => boolean;
  };
  costs: {
    SETTINGS: { taker: Setting; maker: Setting };
    feeAt: (side: "taker" | "maker", iid: number, t: number) => number;
  };
  returns: {
    leg: (
      mk: Market,
      args: { dir: number; tIn: number; h: number; setting: Setting },
    ) => LegResult | null;
  };
  panel: {
    MAX_STALE_MINUTES: number;
    marketFrom: (p: PanelFile) => Market;
    markAtMinuteEnd: (mk: Market, t: number) => number | null;
    tradesAt: (mk: Market, m: number) => number;
    fundingBetween: (
      mk: Market,
      tIn: number,
      tOut: number,
    ) => { sum: number; missing: number };
  };
  nulls: {
    removalOf: (
      fillLists: readonly (readonly Fill[])[],
    ) => (iid: number) => (minute: number) => number;
    dAgainstNull: (
      mk: Market,
      args: {
        dir: number;
        t: number;
        D: number;
        h: number;
        longShare: number;
        removed: (minute: number) => number;
      },
    ) => DResult;
  };
  stats: {
    cr1Test: <T>(
      items: readonly T[],
      clusterOf: (item: T) => string | number,
      valueOf: (item: T) => number,
    ) => Cr1;
    tCritical: (p: number, df: number) => number;
  };
  exits: {
    OPEN_EPS: number;
    liquidationKeys: (events: readonly OrderEvent[]) => Set<string>;
    exitsOf: (g: Group, liqKeys: Set<string>) => CopyExit[];
    planCopy: (
      entry: { t: number; D: number },
      exits: readonly CopyExit[],
      wholeOnLiquidation?: boolean,
    ) => CopyPlan;
    priceCopy: (
      mk: Market,
      args: { dir: number; tIn: number; legs: CopyLeg[]; setting: Setting },
    ) => CopyPrice;
    unpricedReason: (mk: Market, tIn: number, tOut: number) => string;
    chainBreaks: (events: readonly OrderEvent[]) => ChainBreaks;
    crossesBreak: (
      chain: ChainBreaks,
      events: readonly OrderEvent[],
      g: Group,
      plan: CopyPlan,
    ) => boolean;
    winLoss: (values: readonly number[]) => {
      winShare: number | null;
      avgWin: number | null;
      avgLoss: number | null;
      ratio: number | null;
    };
    quantile: (values: readonly number[], q: number) => number | null;
  };
};

const sha256 = (bytes: Buffer): string =>
  createHash("sha256").update(bytes).digest("hex");

/** Checks the vendored files, then imports them; throws on any difference. */
export async function loadResearch(root = RESEARCH_ROOT): Promise<Research> {
  const load = async <T>(file: string): Promise<T> =>
    (await import(pathToFileURL(path.join(root, file)).href)) as T;
  const { checkKit } = await load<{ checkKit: () => string }>("kit/check.mjs");
  const fingerprint = checkKit();
  if (fingerprint !== KIT_FINGERPRINT) {
    throw new Error(
      `the kit's fingerprint ${fingerprint} is not the pinned ${KIT_FINGERPRINT}`,
    );
  }
  const exitsHash = sha256(
    readFileSync(path.join(root, "find-6-exits/lib-exits.mjs")),
  );
  if (exitsHash !== LIB_EXITS_SHA256) {
    throw new Error(
      `lib-exits.mjs: SHA-256 ${exitsHash} is not the pinned ${LIB_EXITS_SHA256}`,
    );
  }
  return {
    fingerprint,
    constants: await load("kit/constants.mjs"),
    fills: await load("kit/fills.mjs"),
    entries: await load("kit/entries.mjs"),
    labels: await load("kit/labels.mjs"),
    cells: await load("kit/cells.mjs"),
    costs: await load("kit/costs.mjs"),
    returns: await load("kit/returns.mjs"),
    panel: await load("kit/panel.mjs"),
    nulls: await load("kit/nulls.mjs"),
    stats: await load("kit/stats.mjs"),
    exits: await load("find-6-exits/lib-exits.mjs"),
  };
}
