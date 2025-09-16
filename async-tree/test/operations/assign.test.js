import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectTree from "../../src/drivers/DeepObjectTree.js";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import assign from "../../src/operations/assign.js";
import plain from "../../src/operations/plain.js";

describe("assign", () => {
  test("assign applies one tree to another", async () => {
    const target = new DeepObjectTree({
      a: 1,
      b: 2,
      more: {
        d: 3,
      },
    });

    const source = new DeepObjectTree({
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
    });

    // Apply changes.
    const result = await assign(target, source);

    assert.equal(result, target);
    assert.deepEqual(await plain(target), {
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

  test("assign() can apply updates to an array", async () => {
    const target = new ObjectTree(["a", "b", "c"]);
    await assign(target, ["d", "e"]);
    assert.deepEqual(await plain(target), ["d", "e", "c"]);
  });
});
