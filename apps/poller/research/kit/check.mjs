// The kit's fingerprint check: a study calls checkKit() at its start. Every
// file listed in FINGERPRINT.sha256 (sha256sum format, paths relative to the
// kit) must exist with that hash, and no other file may sit in the kit; the
// panel's files are pinned through data/panel-manifest.sha256, which the list
// covers. Returns the SHA-256 of FINGERPRINT.sha256 — the kit's fingerprint
// to print in the study's output. Throws on any difference.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const KIT = fileURLToPath(new URL('.', import.meta.url));
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

export function kitFiles(dir = KIT, rel = '') {
  const out = [];
  for (const f of readdirSync(`${dir}${rel}`).sort()) {
    const p = `${rel}${f}`;
    if (statSync(`${dir}${p}`).isDirectory()) out.push(...kitFiles(dir, `${p}/`));
    else if (p !== 'FINGERPRINT.sha256') out.push(p);
  }
  return out;
}

export function checkKit() {
  const list = readFileSync(`${KIT}FINGERPRINT.sha256`);
  const want = new Map();
  for (const line of list.toString('utf8').split('\n')) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) want.set(m[2], m[1]);
  }
  const bad = [];
  const present = kitFiles();
  for (const p of present) if (!want.has(p)) bad.push(`not in the fingerprint: ${p}`);
  for (const [p, h] of want) {
    let got = null;
    try { got = sha(readFileSync(`${KIT}${p}`)); } catch { /* missing */ }
    if (got !== h) bad.push(`${got === null ? 'missing' : 'changed'}: ${p}`);
  }
  if (bad.length) throw new Error(`the research kit differs from its fingerprint:\n  ${bad.join('\n  ')}`);
  return sha(list);
}
