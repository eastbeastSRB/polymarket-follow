// Mutation checks: each rule that decides something is broken on purpose in a
// copy of the kit (a fresh folder under RESEARCH_KIT_TMP, the running session's
// scratchpad, or the system's temp folder), the kit's tests are run on the copy,
// and a failure is expected ("killed"; a crash or a timeout counts as killed).
// A baseline copy, unmutated, must first pass with every test, so a run that
// breaks for another reason is never read as a kill.
// Usage: node kit/mutate.mjs > out/mutation.txt
import { mkdirSync, mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const KIT = fileURLToPath(new URL('.', import.meta.url));
const tmpBase = process.env.RESEARCH_KIT_TMP ?? tmpdir();
mkdirSync(tmpBase, { recursive: true });
const TMP = mkdtempSync(join(tmpBase, 'kit-mutants-'));
const M = [
  // entries.mjs
  ['no same-millisecond chaining', 'entries.mjs', '      if (j > i) {', '      if (false) {'],
  ['no 60 s merge', 'entries.mjs', 'cur.dir === dir && e.t - cur.t <= mergeMs', 'cur.dir === dir && e.t - cur.t < 0'],
  ['the merge window exclusive at 60 s', 'entries.mjs', 'cur.dir === dir && e.t - cur.t <= mergeMs', 'cur.dir === dir && e.t - cur.t < mergeMs'],
  ['forced events open entries', 'entries.mjs', '      if (e.forced) continue;\n', ''],
  ['a flip merges into the group', 'entries.mjs', "if (cur && (e.kind === 'OPEN' || e.kind === 'ADD') && cur.dir === dir", 'if (cur && cur.dir === dir'],
  ['order events keyed without previous_size', 'entries.mjs', 'const k = `${f.oid}|${f.prevS}|${f.iid}`;', 'const k = `${f.oid}|${f.iid}`;'],
  ['the entry window\'s end inclusive', 'entries.mjs', 'if (g.t >= from && g.t < to) groups.push(g);', 'if (g.t >= from && g.t <= to) groups.push(g);'],
  ['the delay without its fixed part', 'entries.mjs', "hashU('R8-delay-v1', id) * T + DELAY_FIXED_MS + R", "hashU('R8-delay-v1', id) * T + R"],
  ['the voted rule from the entry, not its hour\'s end', 'entries.mjs', 'Math.floor(t / HOUR) * HOUR + HOUR + maxDelay(delay) + h <= CUT', 't + maxDelay(delay) + h <= CUT'],
  ['the horizon boundary at 3 h', 'entries.mjs', 'if (hrs < Math.sqrt(6)) return 1 * HOUR;', 'if (hrs < 3) return 1 * HOUR;'],
  ['the exit share of a reduce taken whole', 'entries.mjs', ": (Math.abs(e.prev) - Math.abs(e.after)) / Math.abs(e.prev);", ': 1;'],
  // fills.mjs
  ['the blind store off in the fills reader', 'fills.mjs', 'if (x.timestamp >= CUT) throw', 'if (false) throw'],
  ['invalid rows kept', 'fills.mjs', 'if (!validFill(x)) { dropped++; continue; }', 'if (false) { dropped++; continue; }'],
  ['window samples read as capture', 'fills.mjs', "typeof p.page === 'number')", 'p.page !== undefined)'],
  ['no deduplication', 'fills.mjs', '      if (seen.has(k)) continue;\n', ''],
  ['total_fee ignored', 'fills.mjs', 'fee: Number(x.total_fee ?? x.fee)', 'fee: Number(x.fee)'],
  // panel.mjs
  ['no staleness limit on the mark', 'panel.mjs', 'j >= 0 && i - j <= MAX_STALE_MINUTES', 'j >= 0'],
  ['a settlement at the entry instant charged', 'panel.mjs', 'const lo = upperBound(H, tIn), hi', 'const lo = upperBound(H, tIn - 1), hi'],
  ['a settlement at the exit instant not charged', 'panel.mjs', 'hi = upperBound(H, tOut) - 1;', 'hi = upperBound(H, tOut - 1) - 1;'],
  ['a settlement without a mark ignored', 'panel.mjs', 'const sum = window(cumUnmarked) > 0 ? NaN : window(cum);', 'const sum = window(cum);'],
  ['the blind store off in the panel', 'panel.mjs', 'if (!(p.end <= CUT)) throw', 'if (false) throw'],
  ['funding rows after the cut accepted', 'panel.mjs', 'if (stamp >= CUT) throw', 'if (false) throw'],
  // returns.mjs
  ['funding with the wrong sign', 'returns.mjs', 'const funding = (-dir * f.sum) / pIn;', 'const funding = (dir * f.sum) / pIn;'],
  ['the exit fee forgotten', 'returns.mjs', 'setting.fee(mk.iid, tIn) + (setting.fee(mk.iid, tOut) * pOut) / pIn', 'setting.fee(mk.iid, tIn)'],
  ['the exit spread on the wrong side', 'returns.mjs', 'markOut * (1 - dir * cOut.c)', 'markOut * (1 + dir * cOut.c)'],
  ['gross after costs', 'returns.mjs', 'const gross = (dir * (markOut - markIn)) / markIn;', 'const gross = (dir * (pOut - pIn)) / pIn;'],
  // nulls.mjs
  ['minutes not weighted by trades', 'nulls.mjs', 'const w = tradesAt(mk, m) - removed(m);', 'const w = tradesAt(mk, m) > removed(m) ? 1 : 0;'],
  ['no split of the follow minute by D', 'nulls.mjs', 'sum += w * ((1 - phi) * a + phi * b);', 'sum += w * a;'],
  ['the follow minute one late', 'nulls.mjs', 'const a = matched(value, m + k0 * MIN, longShare);', 'const a = matched(value, m + (k0 + 1) * MIN, longShare);'],
  ['removal ignored', 'nulls.mjs', 'tradesAt(mk, m) - removed(m)', 'tradesAt(mk, m) - 0'],
  ['the long share ignored', 'nulls.mjs', 'return longShare * long + (1 - longShare) * short;', 'return 0.5 * long + 0.5 * short;'],
  ['the hour not the entry\'s UTC hour', 'nulls.mjs', 'const H = Math.floor(t / HOUR) * HOUR;', 'const H = t;'],
  ['a trade between two removed accounts counted twice', 'nulls.mjs', '    if (seen.has(k)) continue;\n', ''],
  // costs.mjs
  ['the regular session from 09:00', 'costs.mjs', 'm >= 570 && m < 960', 'm >= 540 && m < 960'],
  ['the session kept per hour, not per minute', 'costs.mjs', 'const minute = Math.floor(t / 60000);', 'const minute = Math.floor(t / 3600000) * 60;'],
  ['the two tables swapped', 'costs.mjs', "nySession(t) === 'us_regular' ? table.tables.us_regular : table.tables.other", "nySession(t) === 'us_regular' ? table.tables.other : table.tables.us_regular"],
  ['ANT-USD\'s fee override ignored', 'costs.mjs', 'const inForce = o && t >= o.start_time', 'const inForce = false && o && t >= o.start_time'],
  ['the maker pays the spread', 'costs.mjs', 'spread: () => ({ c: 0, fallback: false })', 'spread: (iid, t) => spreadAt(data().pair, iid, t)'],
  ['a category fallback not flagged', 'costs.mjs', 'return { c: w / 1e4, fallback: true };', 'return { c: w / 1e4, fallback: false };'],
  ['crypto majors not split off', 'costs.mjs', "return [6, 7, 8].includes(iid) ? 'crypto-major' : 'crypto-small';", "return 'crypto-small';"],
  // stats.mjs
  ['a one-sided sign test', 'stats.mjs', 'return Math.min(1, 2 * Math.min(lo, hi));', 'return Math.min(1, hi);'],
  ['an unweighted cluster mean', 'stats.mjs', 'return { mean: tot.s / tot.n,', 'return { mean: G.reduce((s, g) => s + g.s / g.n, 0) / K,'],
  ['the t-test with K degrees of freedom', 'stats.mjs', 'p: tTwoSidedP(t, K - 1), n: K', 'p: tTwoSidedP(t, K), n: K'],
  ['the smaller of the two p-values decides', 'stats.mjs', 'Math.max(day.p, trader.p);\n  return { day, trader, p };', 'Math.min(day.p, trader.p);\n  return { day, trader, p };'],
  ['Holm without the dropped hypotheses in m', 'stats.mjs', 'if (sorted[i].p <= alpha / (m - i)) passed.push', 'if (sorted[i].p <= alpha / (sorted.length - i)) passed.push'],
  ['Holm does not stop at the first failure', 'stats.mjs', '    else break;\n', '\n'],
  ['ties not at their average rank', 'stats.mjs', 'r[idx[k][1]] = (i + j) / 2 + 1;', 'r[idx[k][1]] = k + 1;'],
  ['the permutation p without its +1', 'stats.mjs', 'p: (1 + atLeast) / (nPerm + 1)', 'p: atLeast / nPerm'],
  ['Welch\'s degrees of freedom pooled', 'stats.mjs', 'const df = se > 0 ? (sx + sy) ** 2 / (sx ** 2 / (x.length - 1) + sy ** 2 / (y.length - 1)) : x.length + y.length - 2;', 'const df = x.length + y.length - 2;'],
  // labels.mjs
  ['a 7-day label window', 'labels.mjs', 'export const LABEL_DAYS = 14;', 'export const LABEL_DAYS = 7;'],
  ['covered ignores truncation', 'labels.mjs', 'covered: !account.truncated ||', 'covered: true ||'],
  ['habits count cycles whose start is not captured', 'labels.mjs', '&& c.end < at && c.start !== null', '&& c.end < at'],
  ['habits include the instant itself', 'labels.mjs', 'c.end >= from && c.end < at', 'c.end >= from && c.end <= at'],
  ['the long share from adds too', 'labels.mjs', "groups.filter((g) => g.type !== 'ADD' && g.t >= from && g.t < at)", 'groups.filter((g) => g.t >= from && g.t < at)'],
  // cells.mjs
  ['the pre-IPO market kept in the primary cell', 'cells.mjs', "i.category === 'pre_ipo' || R8_LEFT_OUT.includes(i.iid)", 'R8_LEFT_OUT.includes(i.iid)'],
  ['R8\'s five markets kept in the primary cell', 'cells.mjs', "i.category === 'pre_ipo' || R8_LEFT_OUT.includes(i.iid)", "i.category === 'pre_ipo'"],
  ['a retired market left out whole', 'cells.mjs', 'i.settlement ? Math.floor(i.settlement.timestamp / DAY) * DAY : Infinity', 'i.settlement ? -Infinity : Infinity'],
  ['a retired market left out from its settlement instant, not its day', 'cells.mjs', 'Math.floor(i.settlement.timestamp / DAY) * DAY', 'i.settlement.timestamp'],
  ['an unknown market counted in', 'cells.mjs', "if (from === undefined) throw new Error(`instrument ${iid} is not in the rule book`);", ''],
  ['the map\'s first half read', 'cells.mjs', "if (r[5] === '65 days')", "if (r[5] === 'first half')"],
  ['the map\'s direction ignored', 'cells.mjs', 'return !(dir === 1 ? c.long : c.short);', 'return !c.long;'],
  ['closed cells read as open', 'cells.mjs', 'return !(dir === 1 ? c.long : c.short);', 'return dir === 1 ? c.long : c.short;'],
  ['the map\'s directions swapped', 'cells.mjs', 'return !(dir === 1 ? c.long : c.short);', 'return !(dir === 1 ? c.short : c.long);'],
  ['a cell missing from the map taken as open', 'cells.mjs', 'if (!c) throw new Error(`the map has no cell', 'if (!c) return true; if (!c) throw new Error(`the map has no cell'],
  ['a malformed map row accepted', 'cells.mjs', "if (r.length !== 17 || ![r[15], r[16]].every((x) => x === 'true' || x === 'false')) throw", 'if (false) throw'],
  // nulls.mjs, A.0-4's d
  ['d from the entry\'s instant, not its follow instant', 'nulls.mjs', "const gross = value('gross', GROSS)(dir, t + D);", "const gross = value('gross', GROSS)(dir, t);"],
  ['the null\'s hour from the follow instant', 'nulls.mjs', 'const g = exactNull(mk, { t, D, longShare,', 'const g = exactNull(mk, { t: t + D, D, longShare,'],
  ['d from the entry\'s net, not its gross', 'nulls.mjs', "const gross = value('gross', GROSS)(dir, t + D);", "const gross = value('net', GROSS)(dir, t + D);"],
  ['removal left out of d', 'nulls.mjs', "value: value('gross', GROSS), removed });", "value: value('gross', GROSS) });"],
  ['d with its sign reversed', 'nulls.mjs', 'd: gross - g.value', 'd: g.value - gross'],
  ['d without the caller saying whose trades', 'nulls.mjs', "if (typeof removed !== 'function') throw", 'if (false) throw'],
  ['a missing long share accepted', 'nulls.mjs', "if (!(typeof longShare === 'number' && longShare >= 0 && longShare <= 1)) throw", 'if (false) throw'],
  ['d net minus net against the gross null', 'nulls.mjs', "value: value('net', netSetting), removed }).value", "value: value('gross', GROSS), removed }).value"],
  ['d net minus net from the gross entry', 'nulls.mjs', "out.dNet = value('net', netSetting)(dir, t + D)", "out.dNet = value('gross', GROSS)(dir, t + D)"],
  // returns.mjs, A.0-5's risk unit
  ['the risk window reaching into the instant\'s minute', 'returns.mjs', '(M - MIN - h - mk.start) / MIN', '(M - h - mk.start) / MIN'],
  ['a risk start whose exit is past the instant', 'returns.mjs', '(M - MIN - h - mk.start) / MIN', '(M - MIN - mk.start) / MIN'],
  ['the risk window 29 days', 'returns.mjs', 'export const RISK_DAYS = 30;', 'export const RISK_DAYS = 29;'],
  ['unpriced starts counted in the risk unit', 'returns.mjs', '{ s += Math.abs(b / a - 1); c++; }', 's += Math.abs(b / a - 1); c++;'],
  ['the risk unit signed', 'returns.mjs', 's += Math.abs(b / a - 1)', 's += b / a - 1'],
  ['the risk window from the instant, not its minute', 'returns.mjs', 'const M = Math.floor(t / MIN) * MIN;', 'const M = t;'],
  // stats.mjs, question 6's beside-print
  ['CR1 without its K / (K - 1)', 'stats.mjs', 'Math.sqrt((K / (K - 1)) * G.reduce(', 'Math.sqrt(G.reduce('],
  ['CR1 on K degrees of freedom', 'stats.mjs', 'p: tTwoSidedP(t, K - 1), clusters: K', 'p: tTwoSidedP(t, K), clusters: K'],
  ['CR1 about the mean of cluster means', 'stats.mjs', 'const mean = G.reduce((s, g) => s + g.s, 0) / N;', 'const mean = G.reduce((s, g) => s + g.s / g.n, 0) / K;'],
  ['CR1 residuals not summed within a cluster', 'stats.mjs', '(g.s - g.n * mean) ** 2', 'g.n * (g.s / g.n - mean) ** 2'],
  ['the smaller p decides the beside-print', 'stats.mjs', 'Math.max(day.p, trader.p);\n  return { estimate: day.estimate', 'Math.min(day.p, trader.p);\n  return { estimate: day.estimate'],
  // runs.mjs, entry 7
  ['a gap of 10 minutes kept in a chain', 'runs.mjs', 'ts[j + 1] - ts[j] < 10 * MIN', 'ts[j + 1] - ts[j] <= 10 * MIN'],
  ['the 30-minute window exclusive', 'runs.mjs', 'ts[q] - ts[q - 4] <= 30 * MIN', 'ts[q] - ts[q - 4] < 30 * MIN'],
  ['a fourth taker order triggers', 'runs.mjs', 'for (let q = i + 4; q <= j; q++) if (ts[q] - ts[q - 4] <= 30 * MIN)', 'for (let q = i + 3; q <= j; q++) if (ts[q] - ts[q - 3] <= 30 * MIN)'],
  ['half taken is no taker order', 'runs.mjs', 'o.tk / o.n >= 0.5', 'o.tk / o.n > 0.5'],
  ['forced fills in runs', 'runs.mjs', '    if (f.forced) continue;\n', ''],
  ['both sides in one chain', 'runs.mjs', 'const k = `${o.iid}|${o.side}`;', 'const k = `${o.iid}|1`;'],
  ['a run for every qualifying order', 'runs.mjs', 'orders: j - i + 1 }); break; }', 'orders: j - i + 1 }); }'],
  // agreement.mjs, entry 9
  ['two accounts make an event', 'agreement.mjs', 'if (accs.length < 3) continue;', 'if (accs.length < 2) continue;'],
  ['the 60-minute window exclusive', 'agreement.mjs', 'x.t >= e.t - 60 * MIN && x.t <= e.t', 'x.t > e.t - 60 * MIN && x.t <= e.t'],
  ['events not merged', 'agreement.mjs', 'if (e.t - last <= 60 * MIN) continue;', 'if (false) continue;'],
  ['an opposite opening ignored', 'agreement.mjs', 'if (list.some((x) => x.dir !== e.dir && x.t >= first && x.t <= e.t))', 'if (false)'],
  ['links ignored', 'agreement.mjs', 'if (!unlinkedTriple(accs))', 'if (false)'],
  ['shared trades from 19', 'agreement.mjs', 'filter(([, c]) => c >= 20)', 'filter(([, c]) => c >= 19)'],
  ['copies from nine', 'agreement.mjs', 'if (n >= 10)', 'if (n >= 9)'],
  ['the copy window exclusive at 60 s', 'agreement.mjs', 'list[j].t - list[i].t <= 60000', 'list[j].t - list[i].t < 60000'],
  ['copies of the other side', 'agreement.mjs', ' || list[j].dir !== list[i].dir', ''],
  ['the prefix of two hex digits', 'agreement.mjs', 'a.slice(2, 5) === b.slice(2, 5)', 'a.slice(2, 4) === b.slice(2, 4)'],
  ['a copy pattern counted over both orders', 'agreement.mjs', 'const k = `${list[i].addr}>${list[j].addr}`;', "const k = pairKey(list[i].addr, list[j].addr).replace('|', '>');"],
  ['an account\'s repeated trade counted twice', 'agreement.mjs', '      if (seen.has(k)) continue;\n', ''],
  // competition.mjs
  ['the competition\'s end inclusive', 'competition.mjs', 't < COMPETITION.end', 't <= COMPETITION.end'],
  ['the competition\'s start exclusive', 'competition.mjs', 't >= COMPETITION.start', 't > COMPETITION.start'],
  ['boosted only inside the window', 'competition.mjs', 'boosted: boosted.has(iid) }', 'boosted: boosted.has(iid) && t >= COMPETITION.start && t < COMPETITION.end }'],
  ['a boosted market missing', 'competition.mjs', "'ANT-USD', 'AMD-USD', 'ARM-USD', 'SOXL-USD'", "'ANT-USD', 'AMD-USD', 'ARM-USD'"],
  ['an unknown market in the competition', 'competition.mjs', 'if (!all.has(iid)) throw', 'if (false) throw'],
];

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
function runCopy(mutate) {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  cpSync(KIT, `${TMP}/kit`, { recursive: true });
  if (mutate && !mutate(`${TMP}/kit`)) return null;
  const r = spawnSync(process.execPath, ['--test'], { encoding: 'utf8', timeout: 600000, cwd: `${TMP}/kit`, env });
  const num = (k) => Number(new RegExp(`ℹ ${k} (\\d+)`).exec(r.stdout ?? '')?.[1] ?? NaN);
  return { status: r.status ?? r.signal, tests: num('tests'), fail: num('fail') };
}
const base = runCopy(null);
const L = [`mutation checks ${new Date().toISOString()}: ${M.length} mutants of ${KIT}`, `baseline (unmutated copy): exit ${base.status}, tests ${base.tests}, failing ${base.fail}`];
if (base.status !== 0 || !(base.tests > 0) || base.fail !== 0) { console.log(`${L.join('\n')}\nthe baseline does not pass: no mutant is judged`); process.exit(1); }
let survived = 0;
for (const [name, file, from, to] of M) {
  const r = runCopy((dir) => {
    const src = readFileSync(`${dir}/${file}`, 'utf8');
    const at = src.indexOf(from);
    if (at < 0 || src.indexOf(from, at + 1) >= 0) return false;
    writeFileSync(`${dir}/${file}`, src.replace(from, to));
    return true;
  });
  if (!r) { L.push(`ERROR    ${name}: the pattern is not found exactly once in ${file}`); survived++; continue; }
  const killed = r.status !== 0;
  if (!killed) survived++;
  L.push(`${killed ? 'KILLED  ' : 'SURVIVED'} ${name} (${file}: exit ${r.status}, tests ${r.tests}, failing ${Number.isNaN(r.fail) ? 'none counted (a crash)' : r.fail})`);
}
rmSync(TMP, { recursive: true, force: true });
L.push(`${M.length - survived} of ${M.length} mutants killed`);
console.log(L.join('\n'));
process.exitCode = survived ? 1 : 0;
