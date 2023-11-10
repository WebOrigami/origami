import assert from "node:assert";
import { describe, test } from "node:test";
import * as Tree from "../../src/Tree.js";
import sortBy from "../../src/transforms/sortBy.js";

describe("sortBy transform", () => {
  test("sorts keys using a provided sort key function", async () => {
    const tree = Tree.from({
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    });
    const sorted = await sortBy((key, tree) => Tree.traverse(tree, key, "age"))(
      tree
    );
    assert.deepEqual(Array.from(await sorted.keys()), [
      "Bob",
      "Carol",
      "Alice",
    ]);
  });
});
