import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { before, describe, test } from "node:test";
import OriCommandTransform from "../../src/dev/OriCommandTransform.js";
import initializeBuiltins from "../../src/initializeBuiltins.js";

describe("OriCommandTransform", () => {
  before(() => {
    initializeBuiltins();
  });

  test("prefers value defined by base tree even if it starts with '!'", async () => {
    const tree = new (OriCommandTransform(ObjectTree))({
      "!yaml": "foo",
    });
    const value = await tree.get("!yaml");
    assert.equal(value, "foo");
  });

  test("evaluates an Origami expression using the current tree", async () => {
    const tree = new (OriCommandTransform(ObjectTree))({
      a: 1,
      b: 2,
    });
    const value = await tree.get("!keys");
    assert.deepEqual(value, ["a", "b"]);
  });

  test("retrieves an Origami expression in the tree's scope", async () => {
    const parent = new ObjectTree({
      a: 1,
      b: 2,
    });
    const tree = new (OriCommandTransform(ObjectTree))({});
    tree.parent = parent;
    const value = await tree.get("!b");
    assert.deepEqual(value, 2);
  });
});
