/**
 * The universe (COLLECTOR-PLAN §1.1 and §1.3 item 1): one record per address,
 * lower-cased, holding for each source where it was seen — a board's window
 * and sort, or a competition with its parameter — the first and last date.
 * No value of any row: the allowed set for research is a query on sources.
 */

export type Sighting = { first: string; last: string };

export function boardSource(window: string, sort: string): string {
  return `board:${window}:${sort}`;
}

/** The table is read only with `include_unqualified=true`, so the source says so. */
export function competitionSource(competitionId: number): string {
  return `competition:${competitionId}:include_unqualified`;
}

/**
 * One upsert an address: a source's first date never moves later, its last
 * never earlier, and sources accumulate. Dates are `YYYY-MM-DD`, so text order
 * is date order.
 */
export function universeUpdates(
  accounts: readonly string[],
  source: string,
  date: string,
): {
  updateOne: {
    filter: { _id: string };
    update: {
      $min: Record<string, string>;
      $max: Record<string, string>;
    };
    upsert: true;
  };
}[] {
  const unique = new Set(accounts.map((a) => a.toLowerCase()));
  return [...unique].map((account) => ({
    updateOne: {
      filter: { _id: account },
      update: {
        $min: { [`sources.${source}.first`]: date },
        $max: { [`sources.${source}.last`]: date },
      },
      upsert: true,
    },
  }));
}
