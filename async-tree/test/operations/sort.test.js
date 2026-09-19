import assert from "node:assert";
import { describe, test } from "node:test";
import { SyncMap } from "../../src/internal.js";
import keys from "../../src/operations/keys.js";
import sort from "../../src/operations/sort.js";
import SampleAsyncMap from "../SampleAsyncMap.js";

describe("sort", () => {
  test("sorts keys in a sync map using default sort order", () => {
    const sorted = sort({
      file10: null,
      file1: null,
      file9: null,
    });
    assert(sorted instanceof SyncMap);
    const keys = Array.from(sorted.keys());
    assert.deepEqual(keys, ["file1", "file10", "file9"]);
  });

  test("sorts keys in an async map using default sort order", async () => {
    const tree = new SampleAsyncMap(
      Object.entries({
        file10: null,
        file1: null,
        file9: null,
      }),
    );
    const sorted = sort(tree);
    assert.deepEqual(Array.from(await keys(sorted)), [
      "file1",
      "file10",
      "file9",
    ]);
  });

  test("invokes a comparison function", async () => {
    // Reverse order
    const compare = (a, b) => (a > b ? -1 : a < b ? 1 : 0);
    const sorted = sort(
      {
        b: 2,
        c: 3,
        a: 1,
      },
      { compare },
    );
    assert.deepEqual(Array.from(await keys(sorted)), ["c", "b", "a"]);
  });

  test("invokes a sortKey function", async () => {
    const tree = {
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    };
    const sorted = sort(tree, {
      sortKey: async (value, tree) => value.age,
    });
    assert.deepEqual(Array.from(await keys(sorted)), ["Bob", "Carol", "Alice"]);
  });
});
