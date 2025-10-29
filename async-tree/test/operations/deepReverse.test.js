import assert from "node:assert";
import { describe, test } from "node:test";
import deepReverse from "../../src/operations/deepReverse.js";
import plain from "../../src/operations/plain.js";

describe("deepReverse", () => {
  test("reverses keys at all levels of a tree", async () => {
    const tree = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    };
    const reversed = await deepReverse(tree);
    assert.deepEqual(await plain(reversed), {
      b: {
        d: 3,
        c: 2,
      },
      a: 1,
    });
  });
});
