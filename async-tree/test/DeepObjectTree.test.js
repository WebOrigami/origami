import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectTree from "../src/DeepObjectTree.js";
import * as Tree from "../src/Tree.js";

describe("DeepObjectTree", () => {
  test("returns an ObjectTree for value that's a plain sub-object or sub-array", async () => {
    const tree = new DeepObjectTree({
      a: 1,
      object: {
        b: 2,
      },
      array: [3],
    });

    const object = await tree.get("object");
    assert.equal(object instanceof DeepObjectTree, true);
    assert.deepEqual(await Tree.plain(object), { b: 2 });

    const array = await tree.get("array");
    assert.equal(array instanceof DeepObjectTree, true);
    assert.deepEqual(await Tree.plain(array), [3]);
  });
});
