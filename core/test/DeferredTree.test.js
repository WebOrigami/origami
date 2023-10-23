import assert from "node:assert";
import { describe, test } from "node:test";
import DeferredTree from "../src/DeferredTree.js";
import ObjectTree from "../src/ObjectTree.js";
import * as Tree from "../src/Tree.js";

describe("DeferredTree", () => {
  test("lazy-loads a treelike object", async () => {
    const tree = new DeferredTree(async () => ({ a: 1, b: 2, c: 3 }));
    assert.deepEqual(await Tree.plain(tree), { a: 1, b: 2, c: 3 });
  });

  test("sets parent on subtrees", async () => {
    const object = {
      a: 1,
    };
    const parent = new ObjectTree({});
    const fixture = new DeferredTree(() => object);
    fixture.parent2 = parent;
    const tree = await fixture.tree();
    assert.equal(tree.parent2, parent);
  });
});
