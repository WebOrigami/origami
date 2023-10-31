import assert from "node:assert";
import { describe, test } from "node:test";
import SetTree from "../src/SetTree.js";

describe("SetTree", () => {
  test("can get the keys of the tree", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetTree(set);
    assert.deepEqual([...(await fixture.keys())], [0, 1, 2]);
  });

  test("can get the value for a key", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetTree(set);
    const a = await fixture.get(0);
    assert.equal(a, "a");
  });

  test("getting an unsupported key returns undefined", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetTree(set);
    assert.equal(await fixture.get(3), undefined);
  });

  test("sets parent on subtrees", async () => {
    const set = new Set();
    set.add(new Set("a"));
    const fixture = new SetTree(set);
    const subtree = await fixture.get(0);
    assert.equal(subtree.parent, fixture);
  });
});
