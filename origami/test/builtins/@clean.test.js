import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import clean from "../../src/builtins/@clean.js";

describe("@clean", () => {
  test("unsets all public keys in the tree", async () => {
    const tree = new ObjectTree({ a: 1, b: 2, c: 3 });
    await clean.call(null, tree);
    assert.deepEqual(await Tree.plain(tree), {});
  });
});
