/**
 * A whole run of the experiment, `daily()`, end to end over the synthetic
 * world of `paper-e2e.ts`: the gate's refusals, a first run paused at night
 * and resumed, a normal day and a Monday's sweep, the log of every copy, the
 * log's record and the page.
 */
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkFavourites,
  fixedInputs,
  readFavourites,
} from "../src/paper/daily.js";
import { CUT } from "../src/paper/instants.js";
import { LINES } from "../src/paper/score.js";
import { PaperStore } from "../src/paper/store.js";
import {
  A,
  B,
  BOOK_TAKER,
  C,
  F,
  F0,
  F_FROM,
  N,
  at,
  copyAt,
  day,
  expectCopies,
  fillsCalls,
  freeze,
  linesOf,
  logLines,
  makeWorld,
  type LogRecord,
  marketDays,
  pageLines,
  positions,
  sha256,
  slow,
} from "./paper-e2e.js";

describe("a whole run, daily() (R0, R3a, R15; the plan's section 3)", () => {
  it(
    "refuses to read without a valid freeze, then reads a first run across weeks (paused once at night and resumed), a normal day and a Monday's sweep, and writes the log of every copy and the page",
    { timeout: 120_000 },
    async () => {
      const tmp = mkdtempSync(path.join(tmpdir(), "paper-e2e-"));
      try {
        const { pkg, experiment, rules, seeds, paperRoot, kit, real, run } =
          await makeWorld(tmp);
        const root = paperRoot("paper");
        const control = paperRoot("paper-control");
        // The fixed inputs from the package folder: the kit's own, the experiment's files of this world.
        expect([
          real.pool.length,
          real.markets.length,
          real.pinned.size,
        ]).toEqual([1602, 84, 92]);
        expect(real.markets).toContain(6);
        expect(real.favourites).toEqual({ from: F0, addrs: [A, F] });
        expect(real.seedManifest).toEqual(
          new Map([...seeds].map(([w, b]) => [`${w}.json.gz`, sha256(b)])),
        );

        // 1. No freeze: one log line, no request, nothing written but the log.
        const unfrozen = await run(root, "2026-11-25T02:32:00Z");
        expect(unfrozen).toMatchObject({ exit: 4, calls: [], stages: [] });
        expect(readdirSync(root).sort()).toEqual([
          "log",
          "panel-precut",
          "seed",
        ]);
        expect(logLines(root, "2026-11-25").at(-1)).toMatchObject({
          line: "frozen files differ",
          problems: ["no experiment/FROZEN.sha256"],
        });
        // A frozen file changed after the freeze: the same refusal.
        const frozenHash = freeze(pkg);
        writeFileSync(
          path.join(experiment, "rules.md"),
          `${rules}one more line\n`,
        );
        const changed = await run(root, "2026-11-25T02:32:00Z");
        expect(changed).toMatchObject({ exit: 4, calls: [] });
        expect(logLines(root, "2026-11-25").at(-1)).toMatchObject({
          line: "frozen files differ",
          problems: ["changed: experiment/rules.md"],
        });
        writeFileSync(path.join(experiment, "rules.md"), rules);

        // 2. The first run, started at 02:32Z: the backlog from the cut, paused before 02:35Z.
        const first = await run(root, "2026-11-25T02:32:00Z");
        expect(first.exit).toBe(0);
        expect(first.stages).toEqual([
          "reading the rule book",
          "reading",
          "scoring",
          "writing",
        ]);
        expect(logLines(root, "2026-11-25").at(-1)!.reading!.end).toBe(
          "paused",
        );
        expect(first.calls.length).toBeGreaterThan(0);
        expect(
          first.calls.every((c) => c.wall < at("2026-11-25T02:35:00Z")),
        ).toBe(true);
        const readBeforePause = marketDays(root);
        expect(readBeforePause).toBeGreaterThan(0);
        expect(readBeforePause).toBeLessThan(18);
        expect(
          readFileSync(path.join(root, "page", "index.html"), "utf8"),
        ).toContain("reading ended: paused");

        // 3. The same day at 04:00Z: it resumes and ends with what one run without the pause gives.
        const resumed = await run(root, "2026-11-25T04:00:00Z");
        const once = await run(control, "2026-11-25T04:00:00Z");
        expect([resumed.exit, once.exit]).toEqual([0, 0]);
        expect(logLines(root, "2026-11-25").at(-1)!.reading!.end).toBe("done");
        expect(marketDays(root)).toBe(18);
        const end25 = at("2026-11-25T00:00:00Z");
        const copies25 = positions(root, "2026-11-25");
        expect(copies25).toEqual(positions(control, "2026-11-25"));
        expect(
          JSON.parse(readFileSync(path.join(root, "state.json"), "utf8")),
        ).toEqual(
          JSON.parse(readFileSync(path.join(control, "state.json"), "utf8")),
        );
        expectCopies(copies25, end25);
        expect(copies25).toHaveLength(18 + 18 + 7);
        // The slow ones read to END; B by the sweeps of the weeks over; N once, then a standing hole.
        const state25 = new PaperStore(root).readState();
        expect(state25.accounts[A]).toMatchObject({ from: CUT, P: end25 });
        expect(state25.accounts[C]).toMatchObject({ from: CUT, P: end25 });
        expect(state25.accounts[F]).toMatchObject({ from: F_FROM, P: end25 });
        expect(state25.accounts[B]!.P).toBe(at("2026-11-23T00:00:00Z"));
        expect(state25.accounts[N]!.holes).toMatchObject([
          { cause: "account not found", readOn: "2026-11-25" },
        ]);

        // 4. A normal day: the list (A and C by their label, A and F as favourites) and the day's market data, nothing swept.
        const normal = await run(root, "2026-11-26T04:00:00Z");
        expect(normal.exit).toBe(0);
        expect(fillsCalls(normal.calls)).toEqual(
          [A, C, F].map((address) => ({
            address,
            start: "2026-11-25",
            end: "2026-11-26",
          })),
        );
        const other = normal.calls.filter(
          (c) => c.url.pathname !== "/v1/info/fills",
        );
        expect(other.length).toBeGreaterThan(0);
        for (const c of other) {
          expect(c.url.searchParams.get("instrument_id")).toBe("6");
          expect(day(Number(c.url.searchParams.get("start_timestamp")))).toBe(
            "2026-11-25",
          );
        }
        const end26 = at("2026-11-26T00:00:00Z");
        const copies26 = positions(root, "2026-11-26");
        expectCopies(copies26, end26);
        // The position A opened on 11-24 was open at the last run's END; A left it on 11-25: closed now.
        const a24 = slow[A]!.out.find((x) => day(x.open) === "2026-11-24")!;
        expect(copyAt(copies25, A, a24.open).plan.flag).toBe("open");
        expect(copyAt(copies26, A, a24.open).plan.flag).toBeNull();

        // 5. Monday 11-30: the week of 11-23 is over, so the rest of the pool is swept for it.
        const monday = await run(root, "2026-11-30T04:00:00Z");
        expect(monday.exit).toBe(0);
        expect(fillsCalls(monday.calls)).toEqual([
          { address: A, start: "2026-11-26", end: "2026-11-30" },
          { address: C, start: "2026-11-26", end: "2026-11-30" },
          { address: F, start: "2026-11-26", end: "2026-11-30" },
          { address: B, start: "2026-11-23", end: "2026-11-30" },
        ]);
        expect(marketDays(root)).toBe(23);
        expect(new PaperStore(root).readRows(B)).toHaveLength(2);
        const end30 = at("2026-11-30T00:00:00Z");
        const copies30 = positions(root, "2026-11-30");
        expectCopies(copies30, end30);
        expect(copies30).toHaveLength(21 + 21 + 10);

        // The log's record and the page agree with the log of every copy, line by line.
        const record = logLines(root, "2026-11-30").at(-1)!;
        expect(record).toMatchObject({
          frozen: frozenHash,
          reading: { end: "done" },
          copies: 52,
        });
        const lines = linesOf(copies30);
        expect(lines).toEqual({
          MAIN: { positions: 42, traders: 2, days: 21, open: 0 },
          TEN: { positions: 42, traders: 2, days: 21, open: 0 },
          BROAD: { positions: 42, traders: 2, days: 21, open: 0 },
          DAY: { positions: 0, traders: 0, days: 0, open: 0 },
          FAV: { positions: 20, traders: 2, days: 10, open: 0 },
        });
        expect(pageLines(root)).toEqual(lines);
        expect(
          record.lines!.map(({ name, positions: p, open }) => [name, p, open]),
        ).toEqual(
          LINES.map((name) => [name, lines[name].positions, lines[name].open]),
        );
        const page = readFileSync(
          path.join(root, "page", "index.html"),
          "utf8",
        );
        expect(page).toContain(`SHA-256 ${frozenHash}`);
        expect(page).toContain("reading ended: done");
        expect(page).toContain("holes: 1 in 1 accounts (account not found 1)");
        expect(page).toContain("market-days missing: 0");
        expect(page).toContain(`this run: ${monday.calls.length} calls`);
        // The rule book reached the run: the entries after 6 left the list are counted apart, its taker rate prices each copy in and out, its split event and refused document are named.
        expect(page).toContain(
          "unpriced positions: 0; positions in markets outside the primary cells: 6",
        );
        expect(kit.costs.feeAt("taker", 6, CUT)).toBeLessThan(BOOK_TAKER);
        for (const c of copies30) {
          expect(c.money!.fees).toBeGreaterThan(2 * BOOK_TAKER * 1e4 * 0.9);
          expect(c.money!.fees).toBeLessThan(2 * BOOK_TAKER * 1e4 * 1.1);
        }
        expect(page).toContain(
          "split events recorded by the collector: 1 — alarm: their markets are out of the primary cells on the days listed, and positions open across those days are unpriced (R6): 0 unpriced; rule-book documents refused: 1",
        );
        const all = readFileSync(
          path.join(root, "page", "positions.html"),
          "utf8",
        );
        for (const [who, n] of [
          [A, 21],
          [C, 21],
          [F, 10],
        ] as const)
          expect(all.split(`<tr><td class="l">${who}</td>`).length - 1).toBe(n);
        expect(all).toContain('<td class="l">BTC-USD</td>');
        // The day's manifest names each market-day the run wrote, with its hash.
        const manifest = readFileSync(
          path.join(root, "manifest", "2026-11-30.sha256"),
          "utf8",
        );
        for (const d of [
          "2026-11-26",
          "2026-11-27",
          "2026-11-28",
          "2026-11-29",
        ]) {
          const rel = `panel/6/${d}.json.gz`;
          expect(manifest).toContain(
            `${sha256(readFileSync(path.join(root, rel)))} *${rel}`,
          );
        }
        // The run's own backup holds the page and the state.
        expect(existsSync(`${root}-backup/page/index.html`)).toBe(true);
        expect(existsSync(`${root}-backup/state.json`)).toBe(true);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    },
  );

  it(
    "writes the day's record before the page, and names a failed backup and the raw replies not stored on the page",
    { timeout: 60_000 },
    async () => {
      const tmp = mkdtempSync(path.join(tmpdir(), "paper-e2e-"));
      try {
        const { pkg, paperRoot, run } = await makeWorld(tmp);
        freeze(pkg);
        // The raw folder and the backup's folder cannot be made: both are files.
        const root = paperRoot("paper");
        writeFileSync(path.join(root, "raw"), "not a folder");
        writeFileSync(`${root}-backup`, "not a folder");
        expect((await run(root, "2026-11-10T04:00:00Z")).exit).toBe(0);
        const [record, failed] = logLines(root, "2026-11-10").slice(-2) as [
          LogRecord & { rawRepliesNotStored: number },
          LogRecord,
        ];
        expect(record.rawRepliesNotStored).toBeGreaterThan(0);
        expect(failed).toMatchObject({ line: "the backup failed" });
        const page = readFileSync(
          path.join(root, "page", "index.html"),
          "utf8",
        );
        expect(page).toContain(
          `raw replies not stored: ${record.rawRepliesNotStored} (the raw folder refused them)`,
        );
        expect(page).toContain("the backup failed: ");
        // A page that cannot be written fails the run after the day's record, the manifest and the backup.
        const other = paperRoot("paper-2");
        writeFileSync(path.join(other, "page"), "not a folder");
        await expect(run(other, "2026-11-10T04:00:00Z")).rejects.toThrow();
        expect(
          existsSync(path.join(other, "log", "2026-11-10-positions.jsonl.gz")),
        ).toBe(true);
        expect(logLines(other, "2026-11-10").at(-1)!.copies).toBeGreaterThan(0);
        expect(
          existsSync(path.join(other, "manifest", "2026-11-10.sha256")),
        ).toBe(true);
        expect(existsSync(`${other}-backup/state.json`)).toBe(true);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    },
  );
});

describe("the favourites (R1, R2)", () => {
  it("are read lower-case, each once, at most 20; the freeze refuses a bad F0 or a holdout account, and so does a run", async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), "paper-fav-"));
    try {
      const { pkg, kit } = await makeWorld(tmp);
      const iso = new Date(F0).toISOString();
      const text = (addrs: string[], from = iso) =>
        [`from ${from}`, ...addrs, ""].join("\n");
      const mixed = `0x${A.slice(2).toUpperCase()}`;
      expect(readFavourites(text([mixed]))).toEqual({ from: F0, addrs: [A] });
      expect(() => readFavourites(text([A, mixed]))).toThrow(/each once/);
      const many = Array.from(
        { length: 21 },
        (_, i) => `0x${String(i).padStart(40, "0")}`,
      );
      expect(() => readFavourites(text(many))).toThrow(/at most 20/);
      expect(() => readFavourites([A, ""].join("\n"))).toThrow(/from/);
      const pop = JSON.parse(
        readFileSync(
          path.join(pkg, "research", "kit", "data", "population.json"),
          "utf8",
        ),
      ) as { accounts: { addr: string; holdout: boolean }[] };
      const holdout = pop.accounts.find((a) => a.holdout)!.addr.toLowerCase();
      const later = at("2026-11-20T00:00:00Z");
      expect(checkFavourites(text([A, F]), pkg, later)).toEqual({
        from: F0,
        addrs: [A, F],
      });
      expect(() => checkFavourites(text([A]), pkg, F0 - 1)).toThrow(
        /not between the cut and the freeze/,
      );
      expect(() =>
        checkFavourites(text([A], "2026-11-06T23:59:59.000Z"), pkg, later),
      ).toThrow(/not between/);
      expect(() => checkFavourites(text([A, holdout]), pkg, later)).toThrow(
        holdout,
      );
      // A run refuses a holdout favourite too, loudly.
      writeFileSync(
        path.join(pkg, "experiment", "favourites.txt"),
        text([holdout]),
      );
      expect(() => fixedInputs(kit, pkg)).toThrow(holdout);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
