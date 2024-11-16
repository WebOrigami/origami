import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import map from "../../src/tree/map.js";

describe("map", () => {
  test("applies a transform to a tree", async () => {
    const treelike = new ObjectTree([
      { name: "Alice", age: 1 },
      { name: "Bob", age: 2 },
      { name: "Carol", age: 3 },
    ]);
    const result = await map.call(null, treelike, {
      key: (value, key, tree) => value.name,
      value: (value, key, tree) => value.age,
    });
    assert.deepEqual(await Tree.plain(result), {
      Alice: 1,
      Bob: 2,
      Carol: 3,
    });
  });
});
