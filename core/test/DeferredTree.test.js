import assert from "node:assert";
import { describe, test } from "node:test";
import DeferredTree from "../src/DeferredTree.js";
import * as Tree from "../src/Tree.js";

describe("DeferredTree", () => {
  test("lazy-loads a treelike object", async () => {
    const tree = new DeferredTree(async () => ({ a: 1, b: 2, c: 3 }));
    assert.deepEqual(await Tree.plain(tree), { a: 1, b: 2, c: 3 });
  });
});
