import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import defineds from "../../src/operations/defineds.js";

describe("defineds", () => {
  test("returns only defined values in a tree", async () => {
    const obj = {
      a: 1,
      b: undefined,
      c: null,
      d: {
        e: 2,
        f: undefined,
        g: {
          h: 3,
          i: undefined,
        },
      },
    };
    const result = await defineds(obj);
    const plain = await Tree.plain(result);
    assert.deepEqual(plain, { a: 1, d: { e: 2, g: { h: 3 } } });
  });
});
