/**
 * The boundary (src/copyh/schema.ts; rules.md C3; the supervisor's ruling 1
 * on COPYH-STORE's plan): `closedPnl`, `fee` and `builderFee` are cut from a
 * record's bytes before `JSON.parse` — first, in the middle and last; numbers,
 * strings and negatives; a name inside another string value; escapes; a
 * nested object — and any text the cut cannot settle goes to the slow path,
 * whose reviver drops them at any depth; cut-then-parse equals the reviver's
 * parse on synthetic records; ids above 2^53 kept as digits; each field's
 * refusal; the exactness of a double.
 */
import { describe, expect, it } from "vitest";
import {
  RecordSchema,
  cutText,
  exactInDouble,
  parseFast,
  parseSlow,
  recordOf,
} from "../src/copyh/schema.js";

const U = `0x${"aB".repeat(20)}`;
/** cutText over a whole record's text. */
const cut = (text: string) => {
  const b = Buffer.from(text, "utf8");
  return cutText(b, 0, b.length);
};
const rec = (fill: string) => `["${U}",${fill}]`;
const BASE =
  '"coin":"BTC","px":"100.5","sz":"0.25","side":"B","time":1750000000000,"startPosition":"-1.5","dir":"Open Long"';

describe("the cut", { timeout: 60_000 }, () => {
  it("cuts each field wherever it stands: first, in the middle, last, and alone", () => {
    expect(cut(rec(`{"closedPnl":"1.5",${BASE}}`))).toBe(rec(`{${BASE}}`));
    expect(
      cut(
        rec(`{${BASE},"closedPnl":"0.0","hash":"0x00","fee":"0.009","tid":5}`),
      ),
    ).toBe(rec(`{${BASE},"hash":"0x00","tid":5}`));
    expect(cut(rec(`{${BASE},"builderFee":"0.01"}`))).toBe(rec(`{${BASE}}`));
    expect(cut(rec(`{"fee":"1"}`))).toBe(rec("{}"));
    expect(cut(rec(`{"fee":"1","closedPnl":"2"}`))).toBe(rec("{}"));
    expect(cut(rec(`{${BASE},"fee":"1","closedPnl":"2","tid":5}`))).toBe(
      rec(`{${BASE},"tid":5}`),
    );
    expect(cut(rec(`{"fee":"1","tid":5,"closedPnl":"2"}`))).toBe(
      rec(`{"tid":5}`),
    );
    expect(
      cut(rec(`{"fee":"1","builderFee":"2","closedPnl":"3",${BASE}}`)),
    ).toBe(rec(`{${BASE}}`));
  });

  it("cuts numbers, strings and negatives, an exponent and an escaped value whole", () => {
    for (const v of [
      "0.5",
      "-0.5",
      "-12.25",
      "1e-7",
      "-2.5E+3",
      '"-3.2"',
      '"1\\"2"',
      '"ends\\\\"',
      '"\\u0041"',
    ])
      expect(cut(rec(`{${BASE},"closedPnl":${v},"tid":5}`)), v).toBe(
        rec(`{${BASE},"tid":5}`),
      );
  });

  it("leaves a name inside another string value alone, and the field beside it cut", () => {
    const dir = '"dir":"Open \\"fee\\": Long"';
    expect(cut(rec(`{"coin":"BTC",${dir},"fee":"0.1","tid":5}`))).toBe(
      rec(`{"coin":"BTC",${dir},"tid":5}`),
    );
    const hash = '"hash":"0xclosedPnlbuilderFee"';
    expect(cut(rec(`{"coin":"BTC",${hash},"fee":"0.1"}`))).toBe(
      rec(`{"coin":"BTC",${hash}}`),
    );
  });

  it("cuts a field in a nested object, as the reviver drops one at any depth", () => {
    expect(
      cut(rec(`{${BASE},"liquidation":{"fee":"1","method":"market"}}`)),
    ).toBe(rec(`{${BASE},"liquidation":{"method":"market"}}`));
  });

  it("sends to the slow path what its text does not settle", () => {
    for (const fill of [
      `{${BASE},"fee":null}`,
      `{${BASE},"fee":{"a":1}}`,
      `{${BASE},"fee":true}`,
      `{${BASE},"fee":"1" ,"tid":5}`,
      `{${BASE}, "fee":"1"}`,
      `{${BASE},"fee" :"1"}`,
      `{${BASE},"dir2":"fee"}`,
      `{${BASE},"x\\"fee":"1"}`,
      `{${BASE},"fee":"unterminated}`,
    ])
      expect(cut(rec(fill)), fill).toBeNull();
  });

  it("reads only [s, e) of a longer buffer", () => {
    const one = rec(`{${BASE},"fee":"0.1"}`);
    const b = Buffer.from(`xx${one},${one}yy`, "utf8");
    expect(cutText(b, 2, 2 + Buffer.byteLength(one))).toBe(rec(`{${BASE}}`));
  });
});

/** Made-up records with the three fields in every place and form, beside escapes and long ids. */
function synthetic(n: number): string[] {
  const values = ['"0.0"', '"-12.5"', "3.25", "-0.75", '"1\\"x"', '"a\\\\"'];
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const parts = [
      `"coin":"${["BTC", "kPEPE", "@107", "xyz:TSLA"][i % 4]!}"`,
      `"px":"${(i % 97) + 1}.5"`,
      `"sz":"0.${i % 9}1"`,
      `"side":"${i % 2 ? "A" : "B"}"`,
      `"time":${1750000000000 + i}`,
      `"startPosition":"${(i % 13) - 6}.25"`,
      `"dir":"${["Open Long", 'Close "Short"'.replace(/"/g, '\\"'), "Long > Short"][i % 3]!}"`,
      `"hash":"0x${(i % 255).toString(16)}"`,
      `"oid":${i % 5 === 0 ? "18446744073709551615" : 100000 + i}`,
      `"crossed":${i % 2 === 0}`,
      `"tid":${i % 7 === 0 ? "9007199254740993" : 7 * i}`,
    ];
    const extra = [
      `"closedPnl":${values[i % values.length]!}`,
      `"fee":${values[(i + 1) % values.length]!}`,
      ...(i % 3 === 0
        ? [`"builderFee":${values[(i + 2) % values.length]!}`]
        : []),
    ];
    // Each field placed at a position of its own: first, in the middle or last.
    for (const [k, f] of extra.entries())
      parts.splice([0, 5, parts.length][(i + k) % 3]!, 0, f);
    if (i % 4 === 0)
      parts.push(
        `"liquidation":{"liquidatedUser":"${U}","markPx":"1.5","method":"market"}`,
      );
    out.push(rec(`{${parts.join(",")}}`));
  }
  return out;
}

describe("the fast path against the slow path", { timeout: 60_000 }, () => {
  it("gives the reviver's record on 3,000 made-up records, the three fields in neither object", () => {
    let fast = 0;
    for (const text of synthetic(3_000)) {
      const slow = parseSlow(text);
      const c = cut(text);
      if (c === null) continue;
      fast += 1;
      const quick = parseFast(c);
      expect(recordOf(quick), text).toEqual(recordOf(slow));
      expect(recordOf(quick), text).not.toBeNull();
      for (const o of [quick, slow])
        for (const name of ["closedPnl", "fee", "builderFee"])
          expect(JSON.stringify(o)).not.toContain(`"${name}"`);
    }
    expect(fast).toBe(3_000);
  });

  it("drops the three at any depth on the slow path, and keeps every other key", () => {
    expect(
      parseSlow(
        '{"a":{"fee":1,"b":{"closedPnl":"2","c":3}},"builderFee":4,"feeToken":"USDC"}',
      ),
    ).toEqual({ a: { b: { c: 3 } }, feeToken: "USDC" });
  });

  it("keeps ids above 2^53 as their digits on both paths, and short ones by value", () => {
    const text = rec(
      `{${BASE},"oid":18446744073709551615,"crossed":true,"tid":9007199254740993,"fee":"1"}`,
    );
    const want = {
      oid: "18446744073709551615",
      tid: "9007199254740993",
    };
    expect((parseSlow(text) as [string, object])[1]).toMatchObject(want);
    expect((parseFast(cut(text)!) as [string, object])[1]).toMatchObject(want);
    const short = parseFast(rec(`{${BASE},"oid":12,"tid":34}`)) as [
      string,
      { oid: unknown; tid: unknown },
    ];
    expect([short[1].oid, short[1].tid]).toEqual([12, 34]);
  });
});

describe("the schema", { timeout: 60_000 }, () => {
  const good = {
    coin: "BTC",
    px: "100.5",
    sz: "0.25",
    side: "B",
    time: 1750000000000,
    startPosition: "-1.5",
    crossed: true,
    oid: "18446744073709551615",
    tid: 5,
    dir: "Open Long",
    liquidation: { liquidatedUser: U, method: "market" },
  };

  it("reads a record, the user lower-cased, the ids as digits, other keys left out", () => {
    expect(recordOf([U, { ...good, hash: "0x00", feeToken: "USDC" }])).toEqual({
      user: U.toLowerCase(),
      fill: { ...good, tid: "5" },
    });
    const noLiquidation = Object.fromEntries(
      Object.entries(good).filter(([k]) => k !== "liquidation"),
    );
    expect(recordOf([U, noLiquidation])?.fill.liquidation).toBeUndefined();
  });

  it("refuses each field's wrong value, a missing field, and a third element", () => {
    for (const [field, value] of [
      ["coin", ""],
      ["px", "0"],
      ["px", "0.0"],
      ["px", "-1"],
      ["px", "1e5"],
      ["sz", "-1"],
      ["sz", ".5"],
      ["side", "C"],
      ["time", 1.5],
      ["time", 2 ** 53],
      ["startPosition", "1."],
      ["startPosition", "+1"],
      ["crossed", "true"],
      ["oid", -1],
      ["oid", "18446744073709551616"],
      ["tid", "12a"],
      ["tid", 2 ** 53],
      ["dir", ""],
      ["liquidation", { method: "market", liquidatedUser: "0x12" }],
      ["liquidation", { liquidatedUser: U }],
    ] as const)
      expect(
        recordOf([U, { ...good, [field]: value }]),
        `${field} ${JSON.stringify(value)}`,
      ).toBeNull();
    const noDir = Object.fromEntries(
      Object.entries(good).filter(([k]) => k !== "dir"),
    );
    expect(recordOf([U, noDir])).toBeNull();
    expect(recordOf([U, good, 1])).toBeNull();
    expect(recordOf(["0x12", good])).toBeNull();
    expect(RecordSchema.safeParse([U, good]).success).toBe(true);
  });

  it("holds sz and startPosition to 15 significant digits", () => {
    for (const field of ["sz", "startPosition"] as const) {
      expect(
        recordOf([U, { ...good, [field]: "123456789012345" }]),
        field,
      ).not.toBeNull();
      expect(
        recordOf([U, { ...good, [field]: "1234567890123456" }]),
        field,
      ).toBeNull();
    }
    for (const v of ["-1234567890123456", "0.1234567890123456"])
      expect(recordOf([U, { ...good, startPosition: v }]), v).toBeNull();
  });
});

describe("a double's exactness", { timeout: 60_000 }, () => {
  it("holds a decimal text of at most 15 significant digits, whatever its zeros", () => {
    for (const t of [
      "0.0",
      "0",
      "123456789012345",
      "-12345678901234.5",
      "0.000000000000001234",
      "100.10",
      "1000000000000000000000",
      "-0.0",
    ])
      expect(exactInDouble(t), t).toBe(true);
    for (const t of [
      "1234567890123456",
      "-123456789012345.6",
      "0.1234567890123456",
    ])
      expect(exactInDouble(t), t).toBe(false);
  });

  it("is a promise kept: a 15-digit text comes back from its double's shortest text", () => {
    for (const t of [
      "123456789012345",
      "0.000123456789012345",
      "98765.4321098765",
    ]) {
      expect(exactInDouble(t)).toBe(true);
      expect(String(Number(t))).toBe(t);
    }
  });
});
