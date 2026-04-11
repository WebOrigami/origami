import { ObjectMap } from "@weborigami/async-tree";
import { coreGlobals } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import OriCommandTransform from "../../src/dev/OriCommandTransform.js";

describe("OriCommandTransform", () => {
  test("prefers value defined by base tree even if it starts with '!'", async () => {
    const tree = await createFixture({
      "!yaml": "foo",
    });
    const value = await tree.get("!yaml");
    assert.equal(value, "foo");
  });

  test("evaluates an Origami expression using the current tree", async () => {
    const tree = await createFixture({
      a: 1,
      b: 2,
    });
    const value = await tree.get("!keys");
    assert.deepEqual(value, ["a", "b"]);
  });

  test("retrieves an Origami expression in the tree's scope", async () => {
    const parent = new ObjectMap({
      a: 1,
      b: 2,
    });
    const tree = await createFixture({});
    tree.parent = parent;
    const value = await tree.get("!b");
    assert.deepEqual(value, 2);
  });
});

async function createFixture(object) {
  const tree = new (OriCommandTransform(ObjectMap))(object);
  /** @type {any} */ (tree).globals = await coreGlobals();
  return tree;
}
