// The fills reader on synthetic capture files: numbered pages only, the
// boundary check, deduplication, the order, the truncation flag, R8's merged
// file first, and the blind store's refusal.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { readAccount, validFill, fillsFile, BlindStoreError } from '../fills.mjs';
import { CUT } from '../constants.mjs';

// A fresh folder under RESEARCH_KIT_TMP (the running session's scratchpad) or the system's temp folder.
const base = process.env.RESEARCH_KIT_TMP ?? tmpdir();
mkdirSync(base, { recursive: true });
const TMP = mkdtempSync(join(base, 'kit-fills-'));
after(() => rmSync(TMP, { recursive: true, force: true }));
const roots = { capture: `${TMP}/cap`, merged: `${TMP}/merged` };
const row = (over) => ({ trade_id: 1, order_id: 10, instrument_id: 6, timestamp: CUT - 3600000, side: 'long', price: '100', quantity: '2', fee: '0.08', builder_fee: '0', total_fee: '0.08',
  previous_size: '0', previous_entry_price: '0', pnl: '0', fee_asset: 'pUSD', taker: true, liquidation: false, adl: false, settlement: false, hash: '0x', ...over });
const write = (path, pages) => writeFileSync(path, Buffer.concat(pages.map((p) => gzipSync(`${JSON.stringify(p)}\n`))));

test('validFill: every field the reader relies on', () => {
  assert.equal(validFill(row({})), true);
  for (const bad of [{ trade_id: 1.5 }, { order_id: '10' }, { instrument_id: null }, { timestamp: 2 ** 60 }, { side: 'buy' }, { price: '' }, { quantity: 'x' },
    { previous_size: 0 }, { pnl: undefined }, { fee: '1e' }, { total_fee: 5 }, { taker: 'true' }, { liquidation: 1 }]) assert.equal(validFill(row(bad)), false, JSON.stringify(bad));
  assert.equal(validFill(row({ total_fee: undefined })), true);
  assert.equal(validFill(null), false);
});

test('readAccount: pages in order, duplicates once, bad rows dropped and counted, samples left out, sorted, truncation', () => {
  mkdirSync(`${roots.capture}/accounts`, { recursive: true }); mkdirSync(`${roots.capture}/holdout`, { recursive: true }); mkdirSync(roots.merged, { recursive: true });
  const a = '0x' + 'a'.repeat(40);
  write(`${roots.capture}/accounts/${a}.fills.jsonl.gz`, [
    { page: 2, status: 200, body: { data: [row({ trade_id: 3, timestamp: CUT - 9000 }), row({ trade_id: 2, timestamp: CUT - 8000 })], more: true } },
    { page: 1, status: 200, body: { data: [row({ trade_id: 1, timestamp: CUT - 7000, side: 'short' }), row({ trade_id: 2, timestamp: CUT - 8000 }), row({ trade_id: 9, price: 'bad' })], more: true } },
    { page: 'w1', status: 200, body: { data: [row({ trade_id: 77, timestamp: CUT - 9e8 })], more: false }, url: 'https://x/v1/info/fills?end_timestamp=1' },
    { page: 3, status: 500, body: null },
  ]);
  const acc = readAccount(a, roots);
  assert.deepEqual(acc.fills.map((f) => [f.tid, f.t - CUT, f.sgn]), [[3, -9000, 1], [2, -8000, 1], [1, -7000, -1]]);
  assert.deepEqual([acc.pages, acc.dropped, acc.truncated, acc.oldest, acc.newest, acc.folder, acc.merged], [2, 1, true, CUT - 9000, CUT - 7000, 'accounts', false]);
  assert.deepEqual(Object.keys(acc.fills[0]).sort(), ['fee', 'forced', 'iid', 'liq', 'oid', 'pnl', 'prev', 'prevS', 'px', 'q', 'sgn', 't', 'taker', 'tid']);
  assert.equal(acc.fills[0].fee, 0.08);
  // The fee is total_fee (fee + builder_fee) where it is given.
  const b = '0x' + 'e'.repeat(40);
  write(`${roots.capture}/accounts/${b}.fills.jsonl.gz`, [{ page: 1, status: 200, body: { data: [row({ fee: '0.08', builder_fee: '0.02', total_fee: '0.1' }), row({ trade_id: 2, total_fee: undefined, fee: '-0.01' })], more: false } }]);
  assert.deepEqual(readAccount(b, roots).fills.map((f) => f.fee).sort(), [-0.01, 0.1]);
  // R8's merged file wins where it exists; the holdout folder is read too.
  const h = '0x' + 'b'.repeat(40);
  write(`${roots.capture}/holdout/${h}.fills.jsonl.gz`, [{ page: 1, status: 200, body: { data: [row({ trade_id: 5 })], more: true } }]);
  write(`${roots.merged}/${h}.fills.jsonl.gz`, [{ page: 1, status: 200, body: { data: [row({ trade_id: 5 })], more: true } }, { page: 51, status: 200, body: { data: [row({ trade_id: 4, timestamp: CUT - 9e9 })], more: false } }]);
  const hm = readAccount(h, roots);
  assert.deepEqual([hm.folder, hm.merged, hm.truncated, hm.fills.length], ['holdout', true, false, 2]);
  assert.equal(readAccount('0x' + 'c'.repeat(40), roots), null);
  assert.equal(fillsFile('0x' + 'c'.repeat(40), roots), null);
});

test('the blind store: a fill at or after the cut is refused, never read', () => {
  const a = '0x' + 'd'.repeat(40);
  write(`${roots.capture}/accounts/${a}.fills.jsonl.gz`, [{ page: 1, status: 200, body: { data: [row({ trade_id: 1 }), row({ trade_id: 2, timestamp: CUT })], more: false } }]);
  assert.throws(() => readAccount(a, roots), BlindStoreError);
  write(`${roots.capture}/accounts/${a}.fills.jsonl.gz`, [{ page: 1, status: 200, body: { data: [row({ trade_id: 1, timestamp: CUT - 1 })], more: false } }]);
  assert.equal(readAccount(a, roots).fills.length, 1);
});
