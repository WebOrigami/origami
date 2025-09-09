import assert from "node:assert";
import { describe, test } from "node:test";
import { ObjectTree } from "../../src/internal.js";
import parent from "../../src/operations/parent.js";

describe("parent", () => {
  test("returns a tree's parent", async () => {
    const tree = new ObjectTree({
      sub: new ObjectTree({}),
    });
    const sub = await tree.get("sub");
    const result = await parent(sub);
    assert.equal(result, tree);
  });
});
