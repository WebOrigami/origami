import assert from "node:assert";
import { describe, test } from "node:test";
import DeepMapTree from "../../src/drivers/DeepMapTree.js";
import plain from "../../src/operations/plain.js";

describe.skip("DeepMapTree", () => {
  test("returns a DeepMapTree for value that's a Map", async () => {
    const tree = new DeepMapTree([
      ["a", 1],
      ["map", new Map([["b", 2]])],
    ]);
    const map = await tree.get("map");
    assert.equal(map instanceof DeepMapTree, true);
    assert.deepEqual(await plain(map), { b: 2 });
    assert.equal(map.parent, tree);
  });
});
