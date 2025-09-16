import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectTree from "../../src/drivers/DeepObjectTree.js";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import paths from "../../src/operations/paths.js";

describe("paths", () => {
  test("returns an array of paths to the values in the tree", async () => {
    const tree = new DeepObjectTree({
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: 4,
      },
    });
    assert.deepEqual(await paths(tree), ["a", "b", "c/d", "c/e"]);
  });

  test("can focus just on keys with trailing slashes", async () => {
    const tree = new ObjectTree({
      a: 1,
      b: 2,
      // This is a shallow ObjectTree, so `c` won't have a trailing slash
      c: {
        d: 3,
      },
      // Explicitly include a trailing slash to signal a subtree
      "d/": new ObjectTree({
        e: 4,
      }),
    });
    assert.deepEqual(await paths(tree, { assumeSlashes: true }), [
      "a",
      "b",
      "c",
      "d/e",
    ]);
  });
});
