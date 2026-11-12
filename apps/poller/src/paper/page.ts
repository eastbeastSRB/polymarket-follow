/**
 * The daily page (the plan's R15 and section 5, with its review's F17): one
 * static file, its data embedded, its style inline, no script loaded from
 * anywhere and no control that changes anything. Five fixed lines, the
 * verdict box ("Too early to judge" until a look), every paper position
 * newest first (the newest 500 here, all of them in `positions.html`), one
 * row per MAIN trader sorted by address, and what the data lacks. Never on
 * it: a verdict between looks, any other line, threshold or filter, a sort
 * by result, a probability, or the words a test of this file bans.
 */
import type { LineName } from "./score.js";

export type PageLine = {
  name: LineName;
  title: string;
  positions: number;
  traders: number;
  days: number;
  open: number;
  money: { mean: number; se: number | null } | null;
  d: { mean: number; se: number | null; n: number } | null;
  e: { e: number; votes: number } | null;
};

export type PageRow = {
  addr: string;
  symbol: string;
  side: "long" | "short";
  t: number;
  tIn: number;
  entryPrice: number | null;
  legs: string;
  state: "open" | "closed" | "crossing";
  net: number | null;
  flags: string[];
};

export type PageTrader = {
  addr: string;
  positions: number;
  open: number;
  mean: number | null;
  band: { low: number; high: number } | null;
};

export type PageData = {
  /** The rehearsal's banner (part 4): a page on weeks already studied. */
  rehearsal?: string;
  writtenAt: number;
  dataThrough: number;
  frozen: { sha256: string; at: string } | null;
  nextLook: { date: string; z: number } | null;
  verdict: string | null;
  lines: PageLine[];
  rows: PageRow[];
  traders: PageTrader[];
  lacks: string[];
  cost: string;
};

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const iso = (t: number) =>
  new Date(t).toISOString().replace("T", " ").slice(0, 19) + "Z";
const day = (t: number) => new Date(t).toISOString().slice(0, 10);
const bps = (x: number | null | undefined) =>
  x === null || x === undefined ? "—" : `${x >= 0 ? "+" : ""}${x.toFixed(1)}`;

const STYLE = `
:root { --bg: #fafaf8; --fg: #1d1d1b; --muted: #6b6b66; --line: #d9d8d2; --band: #efeee9; }
@media (prefers-color-scheme: dark) { :root { --bg: #1b1b1a; --fg: #e8e7e2; --muted: #a3a29c; --line: #3a3a37; --band: #262624; } }
body { background: var(--bg); color: var(--fg); font: 14px/1.45 system-ui, sans-serif; margin: 0 16px 48px; }
h1 { font-size: 20px; margin: 20px 0 4px; } h2 { font-size: 16px; margin: 28px 0 8px; }
p, li { max-width: 72ch; } .muted { color: var(--muted); }
.box { background: var(--band); border: 1px solid var(--line); padding: 10px 14px; margin: 12px 0; max-width: 72ch; }
table { border-collapse: collapse; font-variant-numeric: tabular-nums; }
th, td { border-bottom: 1px solid var(--line); padding: 3px 10px 3px 0; text-align: right; white-space: nowrap; }
th:first-child, td:first-child, td.l { text-align: left; } .wrap { overflow-x: auto; }
#stale { display: none; font-weight: 600; }`;

function linesTable(lines: readonly PageLine[], z: number | null): string {
  const head = `<tr><th>Line</th><th>Positions</th><th>Traders</th><th>Days</th><th>Open</th><th>Result a position, bps</th><th>Band at the next look</th><th>Against random trades, bps</th><th>Its band</th><th>Daily e-value</th></tr>`;
  const band = (m: { mean: number; se: number | null } | null) =>
    m === null || m.se === null || z === null
      ? "—"
      : `${bps(m.mean - z * m.se)} … ${bps(m.mean + z * m.se)}`;
  const rows = lines.map(
    (l) =>
      `<tr><td>${esc(l.title)}</td><td>${l.positions}</td><td>${l.traders}</td><td>${l.days}</td><td>${l.open}</td>` +
      `<td>${l.money === null ? "—" : `${bps(l.money.mean)} ± ${l.money.se === null ? "—" : l.money.se.toFixed(1)}`}</td><td>${band(l.money)}</td>` +
      `<td>${l.d === null ? "—" : `${bps(l.d.mean)} ± ${l.d.se === null ? "—" : l.d.se.toFixed(1)} (${l.d.n})`}</td><td>${band(l.d)}</td>` +
      `<td>${l.e === null ? "—" : `${l.e.e.toFixed(2)} (${l.e.votes} days)`}</td></tr>`,
  );
  return `<div class="wrap"><table>${head}${rows.join("")}</table></div>`;
}

export function positionsTable(rows: readonly PageRow[]): string {
  const head = `<tr><th>Trader</th><th>Market</th><th>Side</th><th>Trader's fill</th><th>Paper entry</th><th>Entry price</th><th>Exits</th><th>State</th><th>Result, bps</th><th>Flags</th></tr>`;
  const body = rows.map(
    (r) =>
      `<tr><td class="l">${esc(r.addr)}</td><td class="l">${esc(r.symbol)}</td><td class="l">${r.side}</td><td>${iso(r.t)}</td><td>${iso(r.tIn)}</td>` +
      `<td>${r.entryPrice === null ? "—" : esc(String(r.entryPrice))}</td><td class="l">${esc(r.legs)}</td><td class="l">${r.state}</td><td>${bps(r.net)}</td><td class="l">${esc(r.flags.join(", "))}</td></tr>`,
  );
  return `<div class="wrap"><table>${head}${body.join("")}</table></div>`;
}

export const PAGE_ROWS = 500;

export function renderPage(p: PageData): string {
  const verdict =
    p.verdict === null
      ? `Too early to judge${p.nextLook === null ? "" : ` — next look ${esc(p.nextLook.date)}`}.`
      : esc(p.verdict);
  const traders = p.traders.map(
    (t) =>
      `<tr><td class="l">${esc(t.addr)}</td><td>${t.positions}</td><td>${t.open}</td><td>${bps(t.mean)}</td><td>${t.band === null ? "too few days" : `${bps(t.band.low)} … ${bps(t.band.high)}`}</td></tr>`,
  );
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Paper experiment</title><style>${STYLE}</style></head><body>
<h1>Paper experiment</h1>
${p.rehearsal === undefined ? "" : `<div class="box"><strong>${esc(p.rehearsal)}</strong></div>`}
<p>This page records paper positions: each one is opened, on paper, about 80 seconds after a trader of a fixed pool opened a new position, from 7 November 2026 on, and it leaves when the trader leaves. Nothing here is a trade or a recommendation, and nothing on this page can be changed from it. The rules are judged only at three looks (19 December 2026, 6 February 2027, 8 May 2027); keep and drop are verdicts on this test, never instructions to trade.</p>
<p class="muted">Data through ${day(p.dataThrough)} · written ${iso(p.writtenAt)}${p.frozen === null ? "" : ` · rules frozen ${esc(p.frozen.at)}, SHA-256 ${esc(p.frozen.sha256)}`}</p>
${p.frozen === null ? "" : `<p class="muted">The rules were frozen on ${esc(p.frozen.at)} before any result after 7 November existed; whatever this page shows, they do not change.</p>`}
<p id="stale">This page is more than 36 hours old: the daily run has not written it since.</p>
<script>if (Date.now() - ${p.writtenAt} > 36 * 3600 * 1000) document.getElementById("stale").style.display = "block";</script>
<div class="box"><strong>${verdict}</strong></div>
<h2>The five lines</h2>
${linesTable(p.lines, p.nextLook?.z ?? null)}
<p class="muted">"Band at the next look": the result ± the next look's limit × its error — the band the next look will use; a crossing between looks decides nothing. "Against random trades": the position's 24-hour move less that of a random public trade in the same market and hour, positions whose 24 hours have passed only.</p>
<h2>Traders of the main line, by address</h2>
<div class="wrap"><table><tr><th>Trader</th><th>Positions</th><th>Open</th><th>Result a position, bps</th><th>95% band, by day</th></tr>${traders.join("")}</table></div>
<p class="muted">With ${p.traders.length} traders, about 5% of these bands exclude zero by chance alone; these rows decide nothing.</p>
<h2>Paper positions, newest first</h2>
<p class="muted">The newest ${Math.min(PAGE_ROWS, p.rows.length)} of ${p.rows.length}; every one is in positions.html beside this file.</p>
${positionsTable(p.rows.slice(0, PAGE_ROWS))}
<h2>What the data lacks, and what the reads cost</h2>
<ul>${p.lacks.map((l) => `<li>${esc(l)}</li>`).join("")}<li>${esc(p.cost)}</li></ul>
</body></html>
`;
}

/** Every position, newest first: the page's second file. */
export function renderPositions(p: PageData): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Paper positions</title><style>${STYLE}</style></head><body>
<h1>Every paper position</h1><p class="muted">Data through ${day(p.dataThrough)} · written ${iso(p.writtenAt)}</p>
${positionsTable(p.rows)}
</body></html>
`;
}
