import { ObjectTree, Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import PathTransform from "../../exports/PathTransform.js";
describe("PathTransform", () => {
  test("defines an ambient @path value for subtrees", async () => {
    const tree = new (PathTransform(ObjectTree))({
      a: {
        b: {
          c: {},
        },
      },
    });
    const result = await Tree.traverse(tree, "a", "b", "c");
    const path = await result.get("@path");
    assert.equal(path, "a/b/c");
  });
});
