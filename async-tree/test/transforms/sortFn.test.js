import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import sortFn from "../../src/transforms/sortFn.js";

describe("sortFn", () => {
  test("sorts keys using default sort order", async () => {
    const tree = Tree.from({
      file10: null,
      file1: null,
      file9: null,
    });
    const sorted = sortFn()(tree);
    assert.deepEqual(Array.from(await sorted.keys()), [
      "file1",
      "file10",
      "file9",
    ]);
  });

  test("invokes a comparison function", async () => {
    const tree = Tree.from({
      b: 2,
      c: 3,
      a: 1,
    });
    // Reverse order
    const compare = (a, b) => (a > b ? -1 : a < b ? 1 : 0);
    const sorted = sortFn({ compare })(tree);
    assert.deepEqual(Array.from(await sorted.keys()), ["c", "b", "a"]);
  });

  test("invokes a sortKey function", async () => {
    const tree = {
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    };
    const transform = await sortFn({
      sortKey: async (key, tree) => Tree.traverse(tree, key, "age"),
    });
    const result = transform(tree);
    assert.deepEqual(Array.from(await result.keys()), [
      "Bob",
      "Carol",
      "Alice",
    ]);
  });
});
