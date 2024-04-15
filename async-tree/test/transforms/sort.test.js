import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import sort from "../../src/transforms/sort.js";

describe("sort transform", () => {
  test("sorts keys", async () => {
    const tree = Tree.from({
      b: 2,
      c: 3,
      a: 1,
    });
    const sortTransform = sort();
    const sorted = await sortTransform(tree);
    assert.deepEqual(Array.from(await sorted.keys()), ["a", "b", "c"]);
  });

  test("sorts keys using a comparison function", async () => {
    const tree = Tree.from({
      b: 2,
      c: 3,
      a: 1,
    });
    // Reverse order
    const compareFn = (a, b) => (a > b ? -1 : a < b ? 1 : 0);
    const sortTransform = sort(compareFn);
    const sorted = await sortTransform(tree);
    assert.deepEqual(Array.from(await sorted.keys()), ["c", "b", "a"]);
  });
});
