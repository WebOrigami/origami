import assert from "node:assert";
import { describe, test } from "node:test";
import { ObjectMap } from "../../src/internal.js";
import parent from "../../src/operations/parent.js";

describe("parent", () => {
  test("returns a tree's parent", async () => {
    const tree = new ObjectMap({
      sub: new ObjectMap({}),
    });
    const sub = await tree.get("sub");
    const result = parent(sub);
    assert.equal(result, tree);
  });
});
