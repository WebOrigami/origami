import assert from "node:assert";
import { describe, test } from "node:test";
import { DeepObjectTree, Tree } from "../src/internal.js";

describe("DeepObjectTree", () => {
  test("returns an ObjectTree for value that's a plain sub-object or sub-array", async () => {
    const tree = createFixture();

    const object = await tree.get("object");
    assert.equal(object instanceof DeepObjectTree, true);
    assert.deepEqual(await Tree.plain(object), { b: 2 });
    assert.equal(object.parent, tree);

    const array = await tree.get("array");
    assert.equal(array instanceof DeepObjectTree, true);
    assert.deepEqual(await Tree.plain(array), [3]);
    assert.equal(array.parent, tree);
  });

  test("adds trailing slashes to keys for subtrees including plain objects or arrays", async () => {
    const tree = createFixture();
    const keys = Array.from(await tree.keys());
    assert.deepEqual(keys, ["a", "object/", "array/"]);
  });
});

function createFixture() {
  return new DeepObjectTree({
    a: 1,
    object: {
      b: 2,
    },
    array: [3],
  });
}
