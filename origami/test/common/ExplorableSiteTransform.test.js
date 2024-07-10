import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import ExplorableSiteTransform from "../../src/common/ExplorableSiteTransform.js";

describe("ExplorableSiteTransform", () => {
  test.skip("treats an undefined key at the end of a traversal as index.html", async () => {
    const tree = new (ExplorableSiteTransform(ObjectTree))({
      foo: {
        bar: {
          "index.html": "Index",
        },
      },
    });
    const value = await Tree.traverse(tree, ["foo", "bar", undefined]);
    assert.equal(value, "Index");
  });
});
