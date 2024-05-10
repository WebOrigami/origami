import assert from "node:assert";
import { describe, test } from "node:test";
import deepValues from "../../src/operations/deepValues.js";

describe("deepValues", () => {
  test("returns in-order array of a tree's values", async () => {
    const tree = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
      f: {
        g: 4,
      },
    };
    const values = await deepValues(tree);
    assert.deepEqual(values, [1, 2, 3, 4]);
  });
});
