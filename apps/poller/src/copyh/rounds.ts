/**
 * The owner's rounds (copyh/rules.md C14, "Explore"; the engine's plan,
 * section 8, Q3, Q15 and Q16): `dist\copyh.js tries --round <n>`, after look
 * 1's report, on E's priced copies only: step 1's positions file, held to
 * the SHA-256s its result.json names. A round's tries are data, declared in
 * `copyh/tries.json` and committed before the round runs (tries.ts).
 * - Refused (exit 5), before anything is read: a round already written; a
 *   round whose predecessor's output is missing; a tries.json not committed
 *   as it is (git: the file equal to HEAD's); one not of its form (another
 *   covariate's name, the side among them; a fourth round; a round past its
 *   cap of 8, 6 and 4 tries; a name twice); one without the round; one
 *   whose earlier round differs from what that round ran; step 1 not
 *   finished. A fourth round on the command line is exit 2 (main.ts).
 * - The round is one part computed twice (C15's guard; the plan's Q3): each
 *   try's set is its line's copies of E voted by END_E (a look's set; Q15),
 *   those whose covariates meet all its conditions (a condition on a
 *   covariate the copy lacks is false); its figures on E: C12's forms
 *   (verdict.ts), the weeks, m − 2.99·SE and m′ − 2.99·SE′, and what the
 *   choice's other conditions read (the traders' own means, the mean
 *   without the two best days, the traders and days of the priced copies).
 * - `<COPYH_ROOT>\rounds\round-<n>.json`, its identity first. Explore spends
 *   nothing and decides nothing.
 */
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { StringDecoder } from "node:string_decoder";
import { createGunzip } from "node:zlib";
import { z } from "zod";
import { loadResearch, type Research } from "../paper/research.js";
import { CHOICE_BEST_DAYS_LEFT_OUT, ROUNDS, Z_CHOICE } from "./design.js";
import {
  fileSha256,
  partBytes,
  runPhase,
  type PartFunction,
} from "./engine.js";
import { dayOf, weekOf } from "./instants.js";
import { StatisticLine } from "./phase-result.js";
import {
  AlreadyRun,
  PACKAGE_ROOT,
  StoreError,
  fingerprintOf,
  sha256,
  writeWhole,
  type Budget,
} from "./run.js";
import { checkPath, type Seal } from "./seal.js";
import {
  POSITIONS_FILE,
  REPORT_FILE,
  RESULT_FILE,
  identityOf,
  parsedOf,
} from "./steps.js";
import {
  TRIES_FILE,
  TriesFile,
  TryLine,
  inTry,
  tryCopyOf,
  Try,
} from "./tries.js";
import {
  boundsOf,
  statisticOf,
  type JudgedCopy,
  type Statistic,
} from "./verdict.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
type Log = (event: string, fields: object) => void;

/** A round's file, in `<COPYH_ROOT>\rounds\`. */
export const roundFile = (root: string, n: number) =>
  path.join(root, "rounds", `round-${n}.json`);

/** The mean of x over the priced copies but those of the two UTC days of t + D with the largest sums of x (equal sums: the earlier day first); null over no copy (C14's choice, RL8). */
export function withoutBestDays(
  priced: readonly { readonly tIn: number; readonly x: number }[],
): number | null {
  const sums = new Map<number, number>();
  for (const c of priced) {
    const d = dayOf(c.tIn);
    sums.set(d, (sums.get(d) ?? 0) + c.x);
  }
  const best = new Set(
    [...sums]
      .sort(([da, a], [db, b]) => b - a || da - db)
      .slice(0, CHOICE_BEST_DAYS_LEFT_OUT)
      .map(([d]) => d),
  );
  let n = 0;
  let sum = 0;
  for (const c of priced)
    if (!best.has(dayOf(c.tIn))) {
      n += 1;
      sum += c.x;
    }
  return n === 0 ? null : sum / n;
}

/** A try's figures on E (C14: "each try prints"). */
export const TryFigures = z.object({
  name: z.string(),
  line: z.enum(["MAIN", "BROAD"]),
  statistic: StatisticLine,
  /** The UTC weeks of t + D of the priced copies. */
  weeks: z.number(),
  /** m − 2.99·SE and m′ − 2.99·SE′, when both errors exist. */
  lower: z.object({ money: z.number(), edge: z.number() }).nullable(),
  withoutBestDays: z.number().nullable(),
});
export type TryFigures = z.infer<typeof TryFigures>;

/** A try's figures on its set. */
export function figuresOf(
  kit: Research,
  t: Try,
  set: readonly JudgedCopy[],
): TryFigures {
  const statistic: Statistic = statisticOf(kit, set);
  const b = boundsOf(statistic, Z_CHOICE);
  const priced = set.flatMap((c) =>
    c.x === null ? [] : [{ tIn: c.tIn, x: c.x }],
  );
  return {
    name: t.name,
    line: t.line,
    statistic,
    weeks: new Set(priced.map((c) => weekOf(c.tIn))).size,
    lower: b === null ? null : { money: b.money.lower, edge: b.edge.lower },
    withoutBestDays: withoutBestDays(priced),
  };
}

/** A gzipped file's lines in order, each without its newline, read and gunzipped a chunk at a time (never one string), through a pipeline that ends in a Writable, so that what `each` throws rejects with its own error (code-rules, EXPLORE-FIX-1); a last line without its newline is refused (our own file). */
export async function eachGzLine(
  file: string,
  each: (line: string) => void,
): Promise<void> {
  const decoder = new StringDecoder("utf8");
  let rest = "";
  await pipeline(
    createReadStream(file),
    createGunzip(),
    new Writable({
      write(chunk: Buffer, _encoding, done) {
        try {
          const parts = (rest + decoder.write(chunk)).split("\n");
          rest = parts.pop()!;
          for (const p of parts) each(p);
          done();
        } catch (err) {
          done(err as Error);
        }
      },
      final(done) {
        rest += decoder.end();
        done(
          rest === ""
            ? null
            : new StoreError(`${file}: a last line without its newline`),
        );
      },
    }),
  );
}

/** Step 1's positions file as its result.json names it: the file's SHA-256, its lines' count and SHA-256. */
const Positions = z.object({
  file: SHA256,
  lines: z.number().int().nonnegative(),
  sha256: SHA256,
});
export const RoundInputs = z.object({
  code: z.string(),
  round: z.number().int().min(1).max(ROUNDS),
  tries: z.array(Try),
  positions: Positions,
});
export type RoundInputs = z.infer<typeof RoundInputs>;
/** Where a round reads: step 1's positions file. */
export const RoundContext = z.object({ positions: z.string() });

/** A round's function (engine.ts `PartFunction`): the positions file held to step 1's result.json, each try's set and figures. */
export const roundPart: PartFunction = async (inputs, ctx) => {
  const i = RoundInputs.parse(inputs);
  const c = RoundContext.parse(ctx.context);
  checkPath(c.positions, ctx.seal);
  if (fileSha256(c.positions) !== i.positions.file)
    throw new StoreError(
      `${c.positions}: not the file step 1's result.json names`,
    );
  const sets = i.tries.map((): JudgedCopy[] => []);
  const hash = createHash("sha256");
  let lines = 0;
  await eachGzLine(c.positions, (line) => {
    hash.update(`${line}\n`);
    lines += 1;
    const p = TryLine.parse(JSON.parse(line));
    i.tries.forEach((t, k) => {
      if (inTry(p, t)) sets[k]!.push(tryCopyOf(p, t.line));
    });
  });
  if (lines !== i.positions.lines || hash.digest("hex") !== i.positions.sha256)
    throw new StoreError(
      `${c.positions}: its lines are not those step 1's result.json names`,
    );
  return Buffer.from(
    `${JSON.stringify(i.tries.map((t, k) => figuresOf(ctx.kit, t, sets[k]!)))}\n`,
    "utf8",
  );
};

/** `round-<n>.json`: its identity, the round, its tries as they ran, tries.json's SHA-256 and each try's figures. */
export const RoundFile = z.object({
  identity: z.record(z.string(), z.unknown()),
  round: z.number().int().min(1).max(ROUNDS),
  tries: z.array(Try),
  triesSha256: SHA256,
  figures: z.array(TryFigures),
});
export type RoundFile = z.infer<typeof RoundFile>;

/** A committed file's bytes as HEAD holds it (git, in the package folder), or null when HEAD does not hold it or git could not run. */
export function committedOf(packageRoot: string, rel: string): Buffer | null {
  try {
    return execFileSync("git", ["show", `HEAD:./${rel}`], {
      cwd: packageRoot,
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 30_000,
    });
  } catch {
    return null;
  }
}

/** Step 1's result.json's positions, once its report exists (step 1 done). */
const ResultPositions = z.object({
  positions: z.object({
    lines: z.number().int().nonnegative(),
    sha256: SHA256,
    file: z.object({ sha256: SHA256 }),
  }),
});

/** A round's refusals in C14's order, before anything is read: its tries and step 1's positions as its result.json names them. */
export function readyForRound(o: {
  root: string;
  packageRoot: string;
  round: number;
}): {
  tries: Try[];
  triesSha256: string;
  positions: z.infer<typeof Positions>;
} {
  const own = roundFile(o.root, o.round);
  if (existsSync(own)) throw new AlreadyRun(`${own} exists: a round runs once`);
  if (o.round > 1 && !existsSync(roundFile(o.root, o.round - 1)))
    throw new StoreError(
      `round ${o.round}: round ${o.round - 1}'s output is not written`,
    );
  const file = path.join(o.packageRoot, TRIES_FILE);
  if (!existsSync(file)) throw new StoreError(`no ${TRIES_FILE}`);
  const bytes = readFileSync(file);
  const committed = committedOf(o.packageRoot, TRIES_FILE);
  if (committed === null || !committed.equals(bytes))
    throw new StoreError(
      `${TRIES_FILE} is not committed as it is: a round's tries are committed before it runs (C14)`,
    );
  const tries = parsedOf(file, TriesFile, "the rounds' tries");
  const round = tries.rounds[o.round - 1];
  if (round === undefined)
    throw new StoreError(`${TRIES_FILE} declares no round ${o.round}`);
  for (let k = 1; k < o.round; k++) {
    const ran = parsedOf(roundFile(o.root, k), RoundFile, "a round's file");
    if (JSON.stringify(ran.tries) !== JSON.stringify(tries.rounds[k - 1]))
      throw new StoreError(
        `${TRIES_FILE}'s round ${k} is not the one that ran`,
      );
  }
  const look = path.join(o.root, "look1");
  if (!existsSync(path.join(look, REPORT_FILE)))
    throw new StoreError(`${look}: step 1 is not finished (no ${REPORT_FILE})`);
  const r = parsedOf(
    path.join(look, RESULT_FILE),
    ResultPositions,
    "step 1's result",
  );
  return {
    tries: round,
    triesSha256: sha256(bytes),
    positions: {
      file: r.positions.file.sha256,
      lines: r.positions.lines,
      sha256: r.positions.sha256,
    },
  };
}

/** What a gated rounds' command takes from main.ts, after the gate. */
export type RoundsRun = {
  readonly root: string;
  readonly freeze: { readonly sha256: string; readonly tag: string };
  readonly seal: Seal;
  readonly heapGb: number;
  readonly budget: Budget;
  readonly log: Log;
};

/** `tries --round <n>`: the refusals, the round twice (one part, two processes), `round-<n>.json` written whole, its identity first. */
export async function runRound(o: RoundsRun & { round: number }) {
  const ready = readyForRound({
    root: o.root,
    packageRoot: PACKAGE_ROOT,
    round: o.round,
  });
  const kit = await loadResearch();
  const look = path.join(o.root, "look1");
  const dir = path.join(o.root, "rounds", "engine", `round-${o.round}`);
  const record = await runPhase({
    name: `ROUND-${o.round}`,
    dir,
    module: path.join(PACKAGE_ROOT, "dist", "copyh", "rounds.js"),
    fn: "roundPart",
    parts: [
      {
        id: "round",
        inputs: {
          code: fingerprintOf(PACKAGE_ROOT),
          round: o.round,
          tries: ready.tries,
          positions: ready.positions,
        } satisfies RoundInputs,
      },
    ],
    context: { positions: path.join(look, POSITIONS_FILE) },
    workers: 1,
    heapGb: o.heapGb,
    seal: o.seal,
    budget: o.budget,
    log: o.log,
  });
  const figures = z
    .array(TryFigures)
    .parse(JSON.parse(partBytes(dir, record, "round").toString("utf8")));
  const identity = identityOf({
    packageRoot: PACKAGE_ROOT,
    freeze: o.freeze,
    kit: kit.fingerprint,
    files: {
      [`look1/${RESULT_FILE}`]: path.join(look, RESULT_FILE),
      [`look1/${POSITIONS_FILE}`]: path.join(look, POSITIONS_FILE),
      [`look1/${REPORT_FILE}`]: path.join(look, REPORT_FILE),
      [TRIES_FILE]: path.join(PACKAGE_ROOT, TRIES_FILE),
    },
    heapGb: o.heapGb,
  });
  writeWhole(
    roundFile(o.root, o.round),
    `${JSON.stringify(
      {
        identity,
        round: o.round,
        tries: ready.tries,
        triesSha256: ready.triesSha256,
        figures,
      } satisfies RoundFile,
      null,
      1,
    )}\n`,
  );
  o.log("done: the round written", {
    round: o.round,
    file: roundFile(o.root, o.round),
    tries: figures.length,
  });
}
