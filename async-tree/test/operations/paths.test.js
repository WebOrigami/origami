import assert from "node:assert";
import { describe, test } from "node:test";
import paths from "../../src/operations/paths.js";

describe("paths", () => {
  test("returns an array of paths to the values in the tree", async () => {
    const tree = new /** @type {any} */ (Map)([
      ["a", 1],
      ["b", 2],
      [
        "c",
        new Map([
          ["d", 3],
          ["e", 4],
        ]),
      ],
    ]);
    assert.deepEqual(await paths(tree), ["a", "b", "c/d", "c/e"]);
  });

  test("focuses only on trailing slashes if map supports them", async () => {
    const tree = new /** @type {any} */ (Map)([
      ["a", 1],
      ["b", 2],
      // No trailing slash; paths will skip this subtree
      ["c", new Map([["d", 3]])],
      // Explicitly include a trailing slash to signal a subtree
      ["d/", new Map([["e", 4]])],
    ]);
    tree.trailingSlashKeys = true;
    assert.deepEqual(await paths(tree), ["a", "b", "c", "d/e"]);
  });
});
