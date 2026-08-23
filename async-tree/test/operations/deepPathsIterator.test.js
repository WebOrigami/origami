import assert from "node:assert";
import { describe, test } from "node:test";
import deepPathsIterator from "../../src/operations/deepPathsIterator.js";

describe("deepPathsIterator", () => {
  test("yields the paths in the tree", async () => {
    const tree = {
      a: 1,
      b: 2,
      more: {
        c: 3,
        sub: {
          d: 4,
        },
      },
    };

    const paths = [];
    for await (const path of deepPathsIterator(tree)) {
      paths.push(path);
    }
    assert.deepEqual(paths, ["a", "b", "more/c", "more/sub/d"]);
  });

  test("treats maplike values as subtrees", async () => {
    const tree = new /** @type {any} */ (Map)([
      ["a", 1],
      ["b", 2],
      // No trailing slash but the value is maplike
      ["c", new Map([["d", 3]])],
      ["e/", new Map([["f", 4]])],
    ]);
    tree.trailingSlashKeys = true;

    const paths = [];
    for await (const path of deepPathsIterator(tree)) {
      paths.push(path);
    }
    assert.deepEqual(paths, ["a", "b", "c/d", "e/f"]);
  });

  test("assumeSlashKeys option skips getting values unless key has trailing slash", async () => {
    const tree = new /** @type {any} */ (Map)([
      ["a", 1],
      ["b", 2],
      // No trailing slash; paths will skip this subtree
      ["c", new Map([["d", 3]])],
      // Explicitly include a trailing slash to signal a subtree
      ["e/", new Map([["f", 4]])],
    ]);
    tree.trailingSlashKeys = true;

    const paths = [];
    for await (const path of deepPathsIterator(tree, {
      assumeSlashKeys: true,
    })) {
      paths.push(path);
    }
    assert.deepEqual(paths, ["a", "b", "c", "e/f"]);
  });
});
