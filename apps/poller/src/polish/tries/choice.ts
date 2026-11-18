/**
 * The choice rule (POLISH-EXPLORE's plan 5; the polishing plan 2.1 with its
 * review's F2, F4 and F5; decisions 2026-11-18, "POLISH-EXPLORE's plan
 * approved", 3: at most two evaluations on C), as pure functions of the
 * tries' numbers: the changes adopted on E, and C's evaluations in order,
 * each computed only when its turn comes.
 */

export const FAMILIES = ["S", "D", "H", "W", "R", "C", "T", "X", "N"] as const;
export type Family = (typeof FAMILIES)[number];

/** A change is adopted on E at t ≥ 2.5; a rule passes C at t ≥ 1.0; at most three families are combined. */
export const ADOPT_T = 2.5;
export const CHECK_T = 1.0;
export const MAX_FAMILIES = 3;

/** A try's numbers on E, as the E step prints them. */
export type TryOnE = {
  name: string;
  family: Family;
  /** Its place in the try log: ties go to the earlier. */
  order: number;
  /** False for N7 and N8, printed only. */
  adoptable: boolean;
  /** The D-test on E. */
  d: number;
  t: number | null;
  floors: { mean: boolean; days: boolean; coins: boolean };
};

/** Why a try is not adopted, in the rule's order (empty when it is). */
export function refusedFor(x: TryOnE, gain: number): string[] {
  const why: string[] = [];
  if (!x.adoptable) why.push("print only");
  if (x.t === null || x.t < ADOPT_T) why.push(`t below ${ADOPT_T}`);
  if (x.d < gain) why.push("below the gain floor");
  for (const [k, ok] of Object.entries(x.floors))
    if (!ok) why.push(`the ${k} floor`);
  return why;
}

/** Larger t first, a tie to the earlier in the log. */
const byT = (a: TryOnE, b: TryOnE) => b.t! - a.t! || a.order - b.order;

/**
 * Step 3: the adopted changes, largest t first. A try qualifies with no
 * reason against it (`refusedFor`, the gain floor max(+10, 10% of |m_B0|)
 * given); each family keeps its largest t, and the three largest families
 * are taken. The nominee N is B0 with them together.
 */
export function adoptedOf(tries: readonly TryOnE[], gain: number): TryOnE[] {
  const best = new Map<Family, TryOnE>();
  for (const x of [...tries]
    .filter((x) => refusedFor(x, gain).length === 0)
    .sort(byT))
    if (!best.has(x.family)) best.set(x.family, x);
  return [...best.values()].sort(byT).slice(0, MAX_FAMILIES);
}

/** A rule on C, as the C step evaluates it against B0 (k from E). */
export type CheckOnC = {
  rule: string;
  t: number | null;
  floors: { mean: boolean; days: boolean; coins: boolean; footprint: boolean };
};

/** Passes C: t ≥ 1.0 and every one of F2's floors. */
export const passesC = (c: CheckOnC): boolean =>
  c.t !== null && c.t >= CHECK_T && Object.values(c.floors).every(Boolean);

/**
 * Step 4, at most two evaluations (Q3): N; if it fails and more than one
 * change was adopted, the adopted change with the largest t on E, alone;
 * otherwise B0, which nothing evaluates. With nothing adopted, B0 goes and
 * C evaluates nothing. `evaluate` prices and computes a rule only when it is
 * called, so a rule the order does not reach is never computed.
 */
export async function chooseOnC(
  adopted: readonly TryOnE[],
  evaluate: (rule: string) => Promise<CheckOnC>,
): Promise<{ goes: string; evaluations: CheckOnC[] }> {
  const order =
    adopted.length === 0
      ? []
      : adopted.length === 1
        ? ["N"]
        : ["N", adopted[0]!.name];
  const evaluations: CheckOnC[] = [];
  for (const rule of order) {
    const c = await evaluate(rule);
    evaluations.push(c);
    if (passesC(c)) return { goes: rule, evaluations };
  }
  return { goes: "B0", evaluations };
}
