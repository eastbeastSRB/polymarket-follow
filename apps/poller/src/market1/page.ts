/**
 * MARKET-1's daily page (rules.md M14, with MARKET-PLAN-REVIEW F4, F15, F18):
 * one static file, inline style, no script; a link to the paper
 * experiment's page; the verdict box; WAVE's headline on complete weeks
 * only, the current weeks apart; the lines beside by count; the pool's
 * counted fills by week; every WAVE position, newest first. Never on it: a
 * verdict between looks, another line's result, a sort by result, a
 * probability, colours for a sign, or the words M14 bans.
 */
export type PageRow = {
  symbol: string;
  side: "forced sell" | "forced buy";
  t: number;
  accounts: number;
  xIn: number;
  pIn: number | null;
  inAt: "book" | "mark" | "pending";
  xOut: number;
  state: "closed" | "open, at the mark" | "pending";
  net: number | null;
  flags: string[];
  firstSeen: string;
};

export type PageData = {
  runDate: string;
  dataThrough: string;
  readThrough: string | null;
  frozen: { sha256: string; at: string };
  verdict: string[];
  headline: {
    completeBefore: string | null;
    positions: number;
    days: number;
    markets: number;
    mean: number | null;
    se: number | null;
    band: { low: number; high: number } | null;
    tail: {
      worstDay: string;
      largestFall: number;
      mostOpen: number;
      worst: number | null;
    } | null;
    markPriced: number;
    depthShort: number;
    pending: number;
    unpriced: number;
  };
  partial: { positions: number; from: string | null };
  beside: { name: string; positions: number }[];
  weeks: {
    monday: string;
    counted: number;
    liquidated: number;
    active: number;
  }[];
  alarms: string[];
  coinsLeftOut: string[];
  rows: PageRow[];
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const iso = (t: number) =>
  new Date(t).toISOString().slice(0, 16).replace("T", " ");
const bps = (x: number | null) =>
  x === null ? "—" : `${x >= 0 ? "+" : ""}${x.toFixed(1)}`;

const STYLE =
  "body{font-family:system-ui,sans-serif;margin:16px;max-width:1100px;color:#222;background:#fff}" +
  "table{border-collapse:collapse;font-size:13px}td,th{border:1px solid #ccc;padding:3px 6px;text-align:left}" +
  ".box{border:2px solid #444;padding:10px;margin:12px 0}.note{color:#555;font-size:13px}";

function head(title: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><style>${STYLE}</style></head><body>`;
}

function rowsTable(rows: readonly PageRow[]): string {
  const tr = rows
    .map(
      (r) =>
        `<tr><td>${esc(r.symbol)}</td><td>${r.side}</td><td>${iso(r.t)}</td><td>${r.accounts}</td><td>${iso(r.xIn)}</td><td>${r.pIn === null ? "—" : r.pIn.toPrecision(6)} (${r.inAt})</td><td>${iso(r.xOut)}</td><td>${r.state === "pending" ? "pending" : `${bps(r.net)}${r.state === "open, at the mark" ? " (open, at the mark)" : ""}`}</td><td>${esc(r.flags.join(", "))}</td><td>${r.firstSeen}</td></tr>`,
    )
    .join("");
  return `<table><tr><th>market</th><th>forced side</th><th>liquidation (UTC)</th><th>accounts</th><th>in (UTC)</th><th>price in</th><th>out (UTC)</th><th>net, bps</th><th>flags</th><th>first seen</th></tr>${tr}</table>`;
}

export function renderPage(d: PageData): string {
  const h = d.headline;
  const lines = [
    head("MARKET-1"),
    `<p class="note"><a href="../../paper/page/index.html">The paper experiment's page</a></p>`,
    `<h1>MARKET-1: the liquidation wave, a paper test</h1>`,
    `<p>When at least two of the tracked accounts are liquidated the same way in small coins within an hour, this test writes down one paper position of $1,000 against the forced side, two minutes later, closed a day after. Each position is priced at the order book the collector recorded, as a taker, with fees and funding. It never trades.</p>`,
    `<p>Data through ${d.dataThrough}. The pool's trades read through ${d.readThrough ?? "—"}. The waves are found in the accounts the paper experiment has read: within a week about a seventh of them, the rest after its Monday read.</p>`,
    ...d.alarms.map((a) => `<p><strong>${esc(a)}</strong></p>`),
    d.coinsLeftOut.length === 0
      ? ""
      : `<p>Coins left out: ${esc(d.coinsLeftOut.join("; "))}.</p>`,
    `<p class="note">Frozen ${d.frozen.sha256}, ${d.frozen.at}. The rules were frozen on ${d.frozen.at} before any MARKET-1 result existed; whatever this page shows, they do not change.</p>`,
    `<div class="box">${d.verdict.map((v) => `<p>${esc(v)}</p>`).join("")}</div>`,
    `<h2>WAVE, complete weeks${h.completeBefore === null ? "" : ` (positions before ${h.completeBefore})`}</h2>`,
    `<p>${h.positions} positions on ${h.days} days in ${h.markets} markets; mean net ${bps(h.mean)} bps a position${h.se === null ? "" : ` ± ${h.se.toFixed(1)}`}${h.band === null ? "" : `; the band the next look will use: ${bps(h.band.low)} to ${bps(h.band.high)} (a crossing between looks decides nothing)`}.</p>`,
    h.tail === null
      ? ""
      : `<p>The worst day ${esc(h.tail.worstDay)}; the largest fall from a peak ${h.tail.largestFall.toFixed(0)} bps; at most ${h.tail.mostOpen} open at once; the worst position ${bps(h.tail.worst)} bps.</p>`,
    `<p>Priced at the mark on a leg: ${h.markPriced}; depth short: ${h.depthShort}; pending: ${h.pending}; unpriced: ${h.unpriced}.</p>`,
    `<p>Partial: the rest of the pool is read on Monday — ${d.partial.positions} positions${d.partial.from === null ? "" : ` from ${d.partial.from}`}.</p>`,
    `<h2>The lines beside (counts only; their results appear at the looks)</h2>`,
    `<table><tr><th>line</th><th>positions</th></tr>${d.beside.map((b) => `<tr><td>${esc(b.name)}</td><td>${b.positions}</td></tr>`).join("")}</table>`,
    `<h2>The pool's liquidations in small coins, by week</h2>`,
    `<table><tr><th>week (Monday)</th><th>liquidation fills</th><th>accounts liquidated</th><th>accounts trading small coins</th></tr>${d.weeks.map((w) => `<tr><td>${w.monday}</td><td>${w.counted}</td><td>${w.liquidated}</td><td>${w.active}</td></tr>`).join("")}</table>`,
    `<h2>Every WAVE position, newest first</h2>`,
    `<p class="note">The newest 500; all of them on <a href="positions.html">positions.html</a>.</p>`,
    rowsTable(d.rows.slice(0, 500)),
    `<p class="note">Written ${d.runDate}. Keep and drop are verdicts on this test, never instructions to trade.</p>`,
    `</body></html>`,
  ];
  return `${lines.filter((l) => l !== "").join("\n")}\n`;
}

export function renderPositions(d: PageData): string {
  return `${head("MARKET-1 positions")}\n<p class="note"><a href="index.html">MARKET-1</a></p>\n<h1>Every WAVE position, newest first</h1>\n${rowsTable(d.rows)}\n</body></html>\n`;
}

/** The words of a page's text that M14 bans, in any form. */
export const bannedWords = (html: string): string[] =>
  html
    .replace(/<[^>]*>/g, " ")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) =>
      /^(follow|copy|copie|signal|edge|skill|opportunit|recommend)/.test(w),
    );
