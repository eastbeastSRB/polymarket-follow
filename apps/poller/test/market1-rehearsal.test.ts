/**
 * The bridge rehearsal (MARKET-PLAN-REVIEW F7): the old weeks through the
 * forward readers, on pre-cut data only. The seed stands in for the paper
 * experiment's store (written by its own PaperStore, P at the cut); the
 * kit's minute marks stand in for the recordings (a book at mark × (1 ± c),
 * deep enough, at every leg's instant and at each hour's start, written by
 * the collector's own Recorder and BookSampler through fake time, in two
 * phases so that a first run meets pending legs; a minute without a mark is
 * a recorded stall, and one recorded stop of the collector covers a WAVE
 * entry). The real daily run must give the reproduction's net to 1e-9 bps,
 * position for position. It runs only when MARKET1_PRECUT names the pre-cut
 * paths and a FIND-SLOTS slot for its world.
 */
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { pino } from "pino";
import { describe, expect, it } from "vitest";
import { LAUNCH, reproduce } from "../scripts/market1-reproduce.js";
import { daily } from "../src/market1/daily.js";
import { PACKAGE_ROOT, frozenFiles } from "../src/market1/gate.js";
import { kitData } from "../src/market1/inputs.js";
import type { Position } from "../src/market1/lines.js";
import type { Market1Config } from "../src/market1/run.js";
import { CUT } from "../src/paper/instants.js";
import { loadResearch } from "../src/paper/research.js";
import { loadSeed, readManifest } from "../src/paper/seed.js";
import { PaperStore } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { record, type Item } from "./market1-world.js";

const config = process.env.MARKET1_PRECUT;
const log = pino({ level: "silent" });
const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const keyOf = (p: { line: string; iid: number; t: number; side: number }) =>
  `${p.line}|${p.iid}|${p.t}|${p.side}`;

describe.runIf(config !== undefined)(
  "the bridge rehearsal on the old weeks (F7; pre-cut data only)",
  () => {
    it("prices every position through the forward readers as the reproduction does on marks", async () => {
      const c = JSON.parse(readFileSync(config!, "utf8")) as {
        seedDir: string;
        panelDir: string;
        labels: string;
        slot: string;
        rehearsalOut: string;
      };
      const kit = await loadResearch();
      const pure = await reproduce({
        packageRoot: PACKAGE_ROOT,
        seedDir: c.seedDir,
        panelDir: c.panelDir,
        labels: c.labels,
      });
      rmSync(c.slot, { recursive: true, force: true });
      // The package: this build's files and a freeze over them, so the run's gate opens on the slot's world.
      const pkg = path.join(c.slot, "pkg");
      for (const rel of frozenFiles(PACKAGE_ROOT))
        cpSync(path.join(PACKAGE_ROOT, rel), path.join(pkg, rel));
      writeFileSync(
        path.join(pkg, "market1", "FROZEN.sha256"),
        `# written ${new Date().toISOString()} for the rehearsal\n${frozenFiles(
          pkg,
        )
          .map((f) => `${sha256(readFileSync(path.join(pkg, f)))} *${f}`)
          .join("\n")}\n`,
      );
      // The store: each pool account's seed, P at the cut.
      const kd = kitData(PACKAGE_ROOT);
      const paperRoot = path.join(c.slot, "paper");
      const store = new PaperStore(paperRoot);
      const manifest = readManifest(
        readFileSync(
          path.join(PACKAGE_ROOT, "experiment", "seed.sha256"),
          "utf8",
        ),
      );
      const accounts: Record<string, { P: number; from: number; holes: [] }> =
        {};
      for (const addr of kd.pool) {
        const seed = loadSeed(c.seedDir, manifest, addr);
        if (seed === null) continue;
        store.addRows(addr, seed.rows);
        accounts[addr] = { P: CUT, from: LAUNCH, holes: [] };
      }
      store.saveState({ version: 1, accounts });
      cpSync(c.panelDir, path.join(paperRoot, "panel-precut"), {
        recursive: true,
      });
      // The recordings: a book at mark × (1 ± c) at every leg's instant and each hour's start.
      const legs = new Map<string, { iid: number; x: number }>();
      for (const p of pure.positions) {
        if (p.line === "P") continue;
        for (const x of [p.xIn, p.xOut])
          if (x < CUT) legs.set(`${p.iid}|${x}`, { iid: p.iid, x });
      }
      const book = (iid: number, x: number) => {
        const m = kit.panel.markAtMinuteEnd(pure.markets.get(iid)!, x);
        if (m === null) return null;
        const spread = kit.costs.SETTINGS.taker.spread(iid, x).c;
        return {
          bids: [[String(m * (1 - spread)), "1000000000"]],
          asks: [[String(m * (1 + spread)), "1000000000"]],
        };
      };
      const from = LAUNCH - DAY_MS;
      const items: Item[] = [];
      const stalls: { iid: number; x: number }[] = [];
      for (const { iid, x } of legs.values()) {
        const b = book(iid, x);
        if (b === null) {
          stalls.push({ iid, x });
          continue;
        }
        items.push({ kind: "frame", iid, ts: x, recv: x + 150, ...b });
        // The server sends a book every 100 ms: the next second's first frame, the same levels, makes the
        // sampler write this second's last frame at once, into its own hour's file.
        const next = (Math.floor(x / 1_000) + 1) * 1_000;
        items.push({ kind: "frame", iid, ts: next, recv: next + 150, ...b });
      }
      for (const iid of pure.markets.keys()) {
        for (let h = from; h < CUT; h += HOUR_MS) {
          const b = book(iid, h);
          if (b !== null)
            items.push({ kind: "frame", iid, ts: h, recv: h + 150, ...b });
        }
      }
      for (const { iid, x } of stalls) {
        items.push(
          {
            kind: "coverage",
            at: x - 30_000,
            event: { event: "market_stall", iid, lastFrameAt: x - 45_000 },
          },
          {
            kind: "coverage",
            at: x + 30_000,
            event: { event: "market_resume", iid, gapMs: 75_000 },
          },
        );
      }
      for (let d = from; d <= CUT; d += DAY_MS) {
        items.push(
          {
            kind: "coverage",
            at: d + 155 * 60_000,
            event: { event: "rest_pause", state: "start" },
          },
          {
            kind: "coverage",
            at: d + 230 * 60_000,
            event: { event: "rest_pause", state: "end" },
          },
        );
      }
      // One recorded stop of the collector over the first WAVE entry of 2026-10-01.
      const stopped = pure.positions.find(
        (p) => p.line === "WAVE" && p.t >= Date.parse("2026-10-01T00:00:00Z"),
      )!;
      items.push(
        {
          kind: "coverage",
          at: stopped.xIn - 60_000,
          event: { event: "process_stop", pid: 1, reason: "rehearsal" },
        },
        {
          kind: "coverage",
          at: stopped.xIn + 60_000,
          event: {
            event: "process_start",
            pid: 2,
            lastHeartbeatAt: stopped.xIn - 60_000,
          },
        },
      );
      const recordings = path.join(c.slot, "recordings");
      const split = Date.parse("2026-11-05T00:10:00Z");
      const t0 = Date.now();
      await record(
        recordings,
        items.filter((i) => (i.kind === "frame" ? i.recv : i.at) < split),
        from,
        split,
      );
      const recordS = (Date.now() - t0) / 1e3;
      const cfg: Market1Config = {
        STATE_DIR: path.join(c.slot, "var"),
        MARKET1_ROOT: path.join(c.slot, "market1"),
        MARKET1_BACKUP: path.join(c.slot, "backup"),
        PAPER_ROOT: paperRoot,
        RECORDINGS_ROOT: recordings,
        MONGO_URI: "mongodb://unused",
        MONGO_DB: "polymarket_follow_test",
      };
      mkdirSync(cfg.STATE_DIR, { recursive: true });
      const io = {
        packageRoot: pkg,
        ruleBook: () => Promise.resolve([]),
        rehearsal: { from: LAUNCH, start: LAUNCH },
      };
      // The first run meets the days not yet closed: their legs wait.
      const t1 = Date.now();
      expect(
        await daily(
          cfg,
          log,
          () => undefined,
          Date.parse("2026-11-07T10:30:00Z"),
          io,
        ),
      ).toBe(0);
      const run1S = (Date.now() - t1) / 1e3;
      const read = (date: string) =>
        gunzipSync(
          readFileSync(
            path.join(cfg.MARKET1_ROOT, "log", `${date}-positions.jsonl.gz`),
          ),
        )
          .toString("utf8")
          .split("\n")
          .map((l) => JSON.parse(l) as Position & { firstSeen: string });
      const first = read("2026-11-07");
      const pendingFirst = first.filter((p) => p.priced === null).length;
      await record(
        recordings,
        items.filter((i) => (i.kind === "frame" ? i.recv : i.at) >= split),
        split,
        Date.parse("2026-11-08T00:10:00Z"),
      );
      const t2 = Date.now();
      expect(
        await daily(
          cfg,
          log,
          () => undefined,
          Date.parse("2026-11-07T11:30:00Z"),
          io,
        ),
      ).toBe(0);
      const run2S = (Date.now() - t2) / 1e3;
      const final = new Map(read("2026-11-07").map((p) => [keyOf(p), p]));
      const want = pure.positions.filter((p) => p.line !== "P" && p.xOut < CUT);
      let equal = 0;
      let unpricedBoth = 0;
      const differ: string[] = [];
      // Two instants of one market in one second: the sampler stores that second's last frame, so the
      // earlier instant's book is the line before (as M7 reads it); the pure run prices both at the mark.
      const perSecond = new Map<string, Set<number>>();
      for (const { iid, x } of legs.values()) {
        const k = `${iid}|${Math.floor(x / 1_000)}`;
        perSecond.set(k, (perSecond.get(k) ?? new Set()).add(x));
      }
      const sharesASecond = (p: Position) =>
        [p.xIn, p.xOut].some(
          (x) =>
            (perSecond.get(`${p.iid}|${Math.floor(x / 1_000)}`)?.size ?? 0) > 1,
        );
      const shared: string[] = [];
      const markWhy: Record<string, number> = {};
      for (const p of want) {
        const r = final.get(keyOf(p));
        const a = p.priced?.net ?? null;
        const b = r?.priced?.net ?? null;
        for (const m of r?.priced?.markLegs ?? [])
          if (m !== null) markWhy[m] = (markWhy[m] ?? 0) + 1;
        if (a === null && b === null) unpricedBoth += 1;
        else if (a !== null && b !== null && Math.abs(a - b) <= 1e-9)
          equal += 1;
        else if (sharesASecond(p)) shared.push(`${keyOf(p)} ${a} ${b}`);
        else differ.push(`${keyOf(p)} ${a} ${b}`);
      }
      const atBookLegs = (r: Position) =>
        (r.priced?.markLegs ?? []).filter((m) => m === null).length;
      const report = {
        positions: want.length,
        equal,
        unpricedBoth,
        differ,
        sharedSecond: shared,
        pendingAtTheFirstRun: pendingFirst,
        pendingAtTheEnd: [...final.values()].filter(
          (p) => p.priced === null && p.xOut < CUT && p.line !== "P",
        ).length,
        legsAtTheBook: [...final.values()].reduce(
          (s, r) => s + atBookLegs(r),
          0,
        ),
        markLegs: markWhy,
        stalls: stalls.length,
        books: readdirSync(path.join(cfg.MARKET1_ROOT, "books")),
        days: readdirSync(path.join(cfg.MARKET1_ROOT, "days")).length,
        seconds: { record: recordS, firstRun: run1S, secondRun: run2S },
        pageExists: existsSync(
          path.join(cfg.MARKET1_ROOT, "page", "index.html"),
        ),
      };
      writeFileSync(c.rehearsalOut, `${JSON.stringify(report, null, 2)}\n`);
      expect(differ).toEqual([]);
      expect(equal + unpricedBoth + shared.length).toBe(want.length);
      expect(shared.length).toBeLessThanOrEqual(1);
      expect(pendingFirst).toBeGreaterThan(0);
      expect(report.pendingAtTheEnd).toBe(0);
      expect(markWhy["gap: collector stopped"]).toBeGreaterThan(0);
    }, 1_800_000);
  },
);
