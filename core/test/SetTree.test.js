import assert from "node:assert";
import { describe, test } from "node:test";
import SetTree from "../src/SetTree.js";

describe("SetTree", () => {
  test("sets parent on subtrees", async () => {
    const set = new Set();
    set.add(new Set("a"));
    const fixture = new SetTree(set);
    const subtree = await fixture.get(0);
    assert.equal(subtree.parent, fixture);
  });
});
