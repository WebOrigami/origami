import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import parent from "../../src/operations/parent.js";

describe("parent", () => {
  test("returns a tree's parent", async () => {
    const tree = new ObjectMap({
      sub: new ObjectMap({}),
    });
    const sub = await tree.get("sub");
    const result = await parent(sub);
    assert.equal(result, tree);
  });
});
