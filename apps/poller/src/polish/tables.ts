/**
 * The analyzer's tables and their columns (the polishing plan 4.1 and 4.3;
 * decisions 2026-11-17, the plan approved, Q2 and Q3): plain little-endian
 * typed values, a file a column, its type in its name. A u64 is held in
 * memory as two u32 halves, low first, which are its little-endian bytes.
 */

export type ColumnType = "f64" | "u64" | "u32" | "u16" | "u8" | "i8";
export type Column = readonly [name: string, type: ColumnType];
export type Values =
  Float64Array | Uint32Array | Uint16Array | Uint8Array | Int8Array;

/** The 40 coins' taker records in a part, and the 38 coins' tape in the store: H8's order (time, the user's address, `tid`). */
export const TAPE: readonly Column[] = [
  ["time", "f64"],
  ["px", "f64"],
  ["sz", "f64"],
  ["side", "i8"],
  ["flags", "u8"],
  ["user", "u32"],
  ["tid", "u64"],
];

/** Every coin's records with a `liquidation` object, both legs, as a part holds them; the store adds `file`. */
export const LIQ: readonly Column[] = [
  ["time", "f64"],
  ["block", "f64"],
  ["coin", "u16"],
  ["user", "u32"],
  ["liqUser", "u32"],
  ["side", "i8"],
  ["crossed", "u8"],
  ["method", "u8"],
  ["dir", "u8"],
  ["px", "f64"],
  ["sz", "f64"],
  ["markPx", "f64"],
  ["startPosition", "f64"],
  ["fee", "f64"],
  ["closedPnl", "f64"],
  ["tid", "u64"],
  ["oid", "u64"],
];

export const WIDTH: Readonly<Record<ColumnType, number>> = {
  f64: 8,
  u64: 8,
  u32: 4,
  u16: 2,
  u8: 1,
  i8: 1,
};

/** The largest value an id column of this type can hold. */
const MAX: Readonly<Record<ColumnType, number>> = {
  f64: Infinity,
  u64: 0xffffffff,
  u32: 0xffffffff,
  u16: 0xffff,
  u8: 0xff,
  i8: 127,
};

/** A column's values as its bytes (a u64 given as its halves); a value its type cannot hold throws. */
export function bytesOf(type: ColumnType, values: ArrayLike<number>): Buffer {
  let a: Values;
  switch (type) {
    case "f64":
      a = Float64Array.from(values);
      break;
    case "u64":
    case "u32":
      a = Uint32Array.from(values);
      break;
    case "u16":
      a = Uint16Array.from(values);
      break;
    case "u8":
      a = Uint8Array.from(values);
      break;
    case "i8":
      a = Int8Array.from(values);
      break;
  }
  if (type !== "f64")
    for (let i = 0; i < values.length; i++) {
      const v = values[i]!;
      if (
        !Number.isInteger(v) ||
        v > MAX[type] ||
        v < (type === "i8" ? -128 : 0)
      )
        throw new Error(`a ${type} column cannot hold ${v}`);
    }
  return Buffer.from(a.buffer, a.byteOffset, a.byteLength);
}

/** A column's typed values from its bytes, copied so they are aligned (a u64 as its halves, two a row). */
export function valuesOf(type: ColumnType, bytes: Uint8Array): Values {
  // A new array copies (a Buffer's `slice` would not).
  const copy = new Uint8Array(bytes);
  const b = copy.buffer;
  switch (type) {
    case "f64":
      return new Float64Array(b, copy.byteOffset, copy.byteLength / 8);
    case "u64":
    case "u32":
      return new Uint32Array(b, copy.byteOffset, copy.byteLength / 4);
    case "u16":
      return new Uint16Array(b, copy.byteOffset, copy.byteLength / 2);
    case "u8":
      return copy;
    case "i8":
      return new Int8Array(b, copy.byteOffset, copy.byteLength);
  }
}
