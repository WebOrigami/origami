import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectMap from "../../src/drivers/DeepObjectMap.js";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import paths from "../../src/operations/paths.js";

describe("paths", () => {
  test("returns an array of paths to the values in the tree", async () => {
    const tree = new DeepObjectMap({
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
    const tree = new ObjectMap({
      a: 1,
      b: 2,
      // This is a shallow ObjectMap, so `c` won't have a trailing slash
      c: {
        d: 3,
      },
      // Explicitly include a trailing slash to signal a subtree
      "d/": new ObjectMap({
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
