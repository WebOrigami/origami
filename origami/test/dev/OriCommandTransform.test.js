import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import OriCommandTransform from "../../src/dev/OriCommandTransform.js";
import { builtinsTree } from "../../src/internal.js";

describe("OriCommandTransform", () => {
  test("prefers value defined by base tree even if it starts with '!'", async () => {
    const tree = new (OriCommandTransform(ObjectTree))({
      "!yaml": "foo",
    });
    const value = await tree.get("!yaml");
    assert.equal(value, "foo");
  });

  test("evaluates an Origami expression in the tree's scope", async () => {
    const tree = new (OriCommandTransform(ObjectTree))({
      a: 1,
      b: 2,
    });
    tree.parent = builtinsTree;
    const value = await tree.get("!tree:keys");
    assert.deepEqual(await Tree.plain(value), ["a", "b"]);
  });
});
