import assert from "node:assert";
import { describe, test } from "node:test";
import deepTake from "../../src/operations/deepTake.js";
import plain from "../../src/operations/plain.js";

describe("deepTake", () => {
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
    const result = await deepTake(tree, 4);
    assert.deepEqual(await plain(result), [1, 2, 3, 4]);
  });
});
