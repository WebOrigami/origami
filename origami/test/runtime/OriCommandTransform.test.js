import { ObjectTree, Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import builtins from "../../src/builtins/@builtins.js";
import OriCommandTransform from "../../src/runtime/OriCommandTransform.js";

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
    /** @type {any} */ (tree).scope = builtins;
    const value = await tree.get("!@tree/keys");
    assert.deepEqual(await Tree.plain(value), ["a", "b"]);
  });
});
