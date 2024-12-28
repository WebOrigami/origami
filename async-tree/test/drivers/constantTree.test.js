import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import constantTree from "../../src/drivers/constantTree.js";

describe("constantTree", () => {
  test("returns a deep tree that returns constant for all keys", async () => {
    const fixture = constantTree(1);
    assert.equal(await fixture.get("a"), 1);
    assert.equal(await fixture.get("b"), 1);
    assert.equal(await Tree.traverse(fixture, "c/", "d/", "e"), 1);
  });
});
