// The research kit's constants: the blind store's cut and where the data lies.
// The cut (IDEAS-REVIEW A.0-9): a FIND study's inputs end at
// 2026-11-07T00:00:00Z; every reader of the kit refuses a row stamped at or
// after it.
export const CUT = Date.parse('2026-11-07T00:00:00Z');
export const MIN = 60000;
export const HOUR = 3600000;
export const DAY = 86400000;

// R2-STYLE's capture (fills of the pool, read 2026-11-07, every page ending
// before the cut) and R8-PRETEST's completed files for the three accounts R2's
// page cap cut short (rules.json data.completed_fills).
export const R2_CAPTURE = 'F:/polymarket-follow-research/R2-STYLE';
export const R8_MERGED = 'F:/polymarket-follow-research/R8-PRETEST/capture/fills-merged';
// The one-minute panel built by RESEARCH-KIT (scripts/build-panel.mjs).
export const PANEL = 'F:/polymarket-follow-research/KIT/panel';
// The kit's own data files (copies of frozen inputs, each hashed in FINGERPRINT).
export const KIT_DATA = new URL('./data/', import.meta.url);
