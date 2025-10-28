import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import keys from "../../src/operations/keys.js";
import sort from "../../src/operations/sort.js";

describe("sort", () => {
  test("sorts keys using default sort order", async () => {
    const tree = Tree.from({
      file10: null,
      file1: null,
      file9: null,
    });
    const sorted = await sort(tree);
    assert.deepEqual(Array.from(await keys(sorted)), [
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
    const sorted = await sort(tree, { compare });
    assert.deepEqual(Array.from(await keys(sorted)), ["c", "b", "a"]);
  });

  test("invokes a sortKey function", async () => {
    const tree = {
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    };
    const sorted = await sort(tree, {
      sortKey: async (value, key, tree) => value.age,
    });
    assert.deepEqual(Array.from(await keys(sorted)), ["Bob", "Carol", "Alice"]);
  });
});
