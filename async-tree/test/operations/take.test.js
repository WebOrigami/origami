import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import take from "../../src/operations/take.js";

describe("take", () => {
  test("limits the number of keys to the indicated count", async () => {
    const tree = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };
    const result = await take(tree, 2);
    assert.deepEqual(await Tree.plain(result), {
      a: 1,
      b: 2,
    });
  });
});
