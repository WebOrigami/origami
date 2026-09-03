import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import SyncMap from "../../src/drivers/SyncMap.js";
import assign from "../../src/operations/assign.js";
import deepArrays from "../../src/operations/deepArrays.js";
import plain from "../../src/operations/plain.js";
import SampleAsyncMap from "../SampleAsyncMap.js";

describe("assign", () => {
  test("can apply updates from an async tree to a sync tree", async () => {
    const target = new SyncMap([
      ["a", 1],
      ["b", 2],
      ["c", 3],
      ["more", new SyncMap([["e", 3]])],
    ]);

    const source = new SampleAsyncMap([
      ["a", 4], // Overwrite existing value
      ["c", undefined], // Delete existing value
      ["d", 5], // Add
      ["more", [["f", 6]]], // Should leave existing `more` keys alone.
      ["extra", [["g", 7]]], // Add new subtree
    ]);

    // Apply changes.
    const result = await assign(target, source);

    assert.equal(result, target);
    assert.deepEqual(await deepArrays(target), [
      ["a", 4],
      ["b", 2],
      [
        "more",
        [
          ["e", 3],
          ["f", 6],
        ],
      ],
      ["d", 5],
      ["extra", [["g", 7]]],
    ]);
  });

  test("can apply updates to an array", async () => {
    const target = new ObjectMap(["a", "b", "c"]);
    await assign(target, ["d", "e"]);
    assert.deepEqual(await plain(target), ["d", "e", "c"]);
  });

  test("defers to the target's assign method if it exists", async () => {
    let called = false;
    const target = new SyncMap();
    /** @type {any} */ (target).assign = async (source) => {
      called = true;
    };
    await assign(target, { a: 1 });
    assert.equal(called, true);
  });
});
