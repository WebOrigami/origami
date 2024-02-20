import { DeepObjectTree, ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import setDeep from "../../src/builtins/@setDeep.js";
describe("@tree/setDeep", () => {
  test("can apply updates with a single argument to set", async () => {
    const tree = new DeepObjectTree({
      a: 1,
      b: 2,
      more: {
        d: 3,
      },
    });

    // Apply changes.
    await setDeep(
      tree,
      new DeepObjectTree({
        a: 4, // Overwrite existing value
        b: undefined, // Delete
        c: 5, // Add
        more: {
          // Should leave existing `more` keys alone.
          e: 6, // Add
        },
        // Add new subtree
        extra: {
          f: 7,
        },
      })
    );

    assert.deepEqual(await Tree.plain(tree), {
      a: 4,
      c: 5,
      more: {
        d: 3,
        e: 6,
      },
      extra: {
        f: 7,
      },
    });
  });

  test("can apply updates to an array", async () => {
    const tree = new ObjectTree(["a", "b", "c"]);
    await setDeep(tree, ["d", "e"]);
    assert.deepEqual(await Tree.plain(tree), ["d", "e", "c"]);
  });
});
