import assert from "node:assert";
import { describe, test } from "node:test";
import SetTree from "../../src/drivers/SetTree.js";
import { ObjectTree } from "../../src/internal.js";

describe.skip("SetTree", () => {
  test("can get the keys of the tree", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetTree(set);
    assert.deepEqual(Array.from(await fixture.keys()), [0, 1, 2]);
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

  test("getting a null/undefined key throws an exception", async () => {
    const set = new Set(["a", "b", "c"]);
    const fixture = new SetTree(set);
    await assert.rejects(async () => {
      await fixture.get(null);
    });
    await assert.rejects(async () => {
      await fixture.get(undefined);
    });
  });

  test("sets parent on subtrees", async () => {
    const set = new Set();
    set.add(new ObjectTree({}));
    const fixture = new SetTree(set);
    const subtree = await fixture.get(0);
    assert.equal(subtree.parent, fixture);
  });
});
