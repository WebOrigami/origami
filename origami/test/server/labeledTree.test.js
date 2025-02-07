import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import labeledTree from "../../src/server/labeledTree.js";

describe("labeledTree", () => {
  test("converts a plain object into a labeled tree", async () => {
    const object = {
      value: 8,
      0: {
        value: 4,
        0: {
          value: 3,
        },
      },
    };
    const tree = labeledTree(object);
    assert.strictEqual(tree.valueOf(), 8);
    assert.deepEqual(await tree.keys(), ["0", "value"]);
    assert.equal(await Tree.traversePath(tree, "/0/0"), 3);
  });
});
