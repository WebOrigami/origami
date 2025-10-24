import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import SyncMap from "../../src/drivers/SyncMap.js";
import assign from "../../src/operations/assign.js";
import plain from "../../src/operations/plain.js";
import { deepEntries } from "../../src/Tree.js";
import SampleAsyncMap from "../SampleAsyncMap.js";

describe("assign", () => {
  test("assign can apply updates from an async tree to a sync tree", async () => {
    const target = new SyncMap([
      ["a", 1],
      ["b", 2],
      ["more", new SyncMap([["d", 3]])],
    ]);

    const source = new SampleAsyncMap([
      ["a", 4], // Overwrite existing value
      ["c", 5], // Add
      ["more", [["e", 6]]], // Should leave existing `more` keys alone.
      ["extra", [["f", 7]]], // Add new subtree
    ]);

    // Apply changes.
    const result = await assign(target, source);

    assert.equal(result, target);
    assert.deepEqual(await deepEntries(target), [
      ["a", 4],
      ["b", 2],
      [
        "more",
        [
          ["d", 3],
          ["e", 6],
        ],
      ],
      ["c", 5],
      ["extra", [["f", 7]]],
    ]);
  });

  test("assign() can apply updates to an array", async () => {
    const target = new ObjectTree(["a", "b", "c"]);
    await assign(target, ["d", "e"]);
    assert.deepEqual(await plain(target), ["d", "e", "c"]);
  });
});
