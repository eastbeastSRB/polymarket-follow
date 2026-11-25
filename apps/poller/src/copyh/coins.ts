/**
 * COPY-H's coins (copyh/rules.md C3, `coins.json`; the review's L2): the
 * main-dex coin list of one `meta` reply of Hyperliquid's public info API,
 * stored raw by COPYH-FUNDING (`<COPYH_FUNDING>\info\meta.json`) and held to
 * its line in that store's `manifest.jsonl`; in the reply's `universe` order,
 * so that a coin's index is its iid (Hyperliquid's asset id), delisted coins
 * included with their flag as read. Append-only: an iid seeds an entry's
 * delay, so a later list may only add coins at its end. A record's coin is
 * read by its form: a builder dex's (`dex:COIN`), spot's (`@n` or a pair with
 * `/`), else main-dex-shaped; a kept record whose coin is not in the list
 * stops the step.
 */
import { z } from "zod";
import { StoreError, sha256 } from "./run.js";

/** The meta reply's key in COPYH-FUNDING's store. */
export const META_KEY = "info/meta.json";

const MetaReply = z.object({
  universe: z
    .array(
      z.object({
        name: z.string().min(1),
        szDecimals: z.number().int().nonnegative(),
        isDelisted: z.boolean().optional(),
      }),
    )
    .min(1),
});

/** The funding store's manifest line of a file: what the reply is held to. */
export const StoredLine = z.object({
  key: z.string().min(1),
  bytes: z.number().int().nonnegative(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  fetchedAt: z.string().min(1),
});
export type StoredLine = z.infer<typeof StoredLine>;

const Coin = z.object({
  iid: z.number().int().nonnegative(),
  name: z.string().min(1),
  szDecimals: z.number().int().nonnegative(),
  delisted: z.boolean(),
});

/** `coins.json` (our own file: one that does not parse throws). */
export const CoinsFile = z
  .object({
    rule: z.string(),
    meta: z.object({
      key: z.literal(META_KEY),
      bytes: z.number().int().nonnegative(),
      sha256: z.string().regex(/^[0-9a-f]{64}$/),
      read: z.string().min(1),
    }),
    coins: z.array(Coin).min(1),
  })
  .refine((f) => f.coins.every((c, i) => c.iid === i), {
    message: "a coin's iid is not its index",
    path: ["coins"],
  })
  .refine((f) => new Set(f.coins.map((c) => c.name)).size === f.coins.length, {
    message: "a coin is named twice",
    path: ["coins"],
  });
export type CoinsFile = z.infer<typeof CoinsFile>;

/** `coins.json` from the stored reply's bytes, held to its manifest line first. */
export function coinsFromMeta(bytes: Buffer, line: StoredLine): CoinsFile {
  if (line.key !== META_KEY)
    throw new StoreError(`${line.key} is not ${META_KEY}`);
  if (bytes.length !== line.bytes || sha256(bytes) !== line.sha256)
    throw new StoreError(
      `${META_KEY} is not the bytes its manifest line names`,
    );
  let json: unknown;
  try {
    json = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new StoreError(`${META_KEY} is not JSON`);
  }
  const r = MetaReply.safeParse(json);
  if (!r.success)
    throw new StoreError(
      `${META_KEY} is not meta's shape: ${r.error.issues[0]?.message ?? ""}`,
    );
  return CoinsFile.parse({
    rule: "copyh/rules.md C3: the main-dex coins of one stored meta reply, in its universe order; a coin's iid is its index",
    meta: {
      key: META_KEY,
      bytes: line.bytes,
      sha256: line.sha256,
      read: line.fetchedAt,
    },
    coins: r.data.universe.map((u, iid) => ({
      iid,
      name: u.name,
      szDecimals: u.szDecimals,
      delisted: u.isDelisted === true,
    })),
  });
}

/** Refuses a list that is not the earlier one with coins appended at its end: an index never changes. */
export function checkAppendOnly(earlier: CoinsFile, later: CoinsFile): void {
  if (later.coins.length < earlier.coins.length)
    throw new StoreError(
      `the new list has ${later.coins.length} coins, the earlier ${earlier.coins.length}`,
    );
  earlier.coins.forEach((c, i) => {
    if (later.coins[i]!.name !== c.name)
      throw new StoreError(
        `iid ${i} is ${c.name} in the earlier list, ${later.coins[i]!.name} in the new one`,
      );
  });
}

/** A record's coin by its form (C3). */
export type CoinForm = "main" | "spot" | "builder";
export const formOfCoin = (coin: string): CoinForm =>
  coin.includes(":")
    ? "builder"
    : coin.startsWith("@") || coin.includes("/")
      ? "spot"
      : "main";

/** The coins by name: a name's iid. */
export const iidsOf = (f: CoinsFile): ReadonlyMap<string, number> =>
  new Map(f.coins.map((c) => [c.name, c.iid]));
