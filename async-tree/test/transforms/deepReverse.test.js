import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import deepReverse from "../../src/transforms/deepReverse.js";

describe("deepReverse", () => {
  test("reverses keys at all levels of a tree", async () => {
    const tree = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
    };
    const reversed = deepReverse.call(null, tree);
    assert.deepEqual(await Tree.plain(reversed), {
      b: {
        d: 3,
        c: 2,
      },
      a: 1,
    });
  });
});
