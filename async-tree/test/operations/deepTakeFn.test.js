import assert from "node:assert";
import { describe, test } from "node:test";
import deepTakeFn from "../../src/operations/deepTakeFn.js";

describe("deepTakeFn", () => {
  test("traverses deeply and returns a limited number of items", async () => {
    const tree = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
        f: 4,
      },
      g: 5,
    };
    const result = await deepTakeFn(4)(tree);
    assert.deepEqual(result, [1, 2, 3, 4]);
  });
});
