import { ObjectTree, Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import DefaultValuesTransform from "../../src/common/DefaultValuesTransform.js";
describe("DefaultValuesTransform", () => {
  test("provides default values for missing keys at any point in tree", async () => {
    const tree = new (DefaultValuesTransform(ObjectTree))({
      a: 1,
      b: 2,
      more: {
        c: 3,
      },
    });
    tree.defaults = {
      b: 4,
      d: 5,
    };

    // Default values don't show up in keys
    assert.deepEqual(Array.from(await tree.keys()), ["a", "b", "more"]);

    assert.equal(await tree.get("a"), 1);
    assert.equal(await tree.get("b"), 2); // Respects main tree
    assert.equal(await tree.get("d"), 5); // Default
    assert.equal(await Tree.traverse(tree, "more", "b"), 4); // Default
    assert.equal(await Tree.traverse(tree, "more", "c"), 3);
    assert.equal(await Tree.traverse(tree, "more", "d"), 5); // Default
  });

  test("invokes a default value function", async () => {
    const tree = new (DefaultValuesTransform(ObjectTree))({
      a: 1,
      more: {
        b: 2,
      },
    });
    tree.defaults = {
      c: () => 3,
    };
    assert.equal(await tree.get("c"), 3);
    assert.equal(await Tree.traverse(tree, "more", "c"), 3);
  });
});
