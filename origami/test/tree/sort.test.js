import assert from "node:assert";
import { describe, test } from "node:test";
import sort from "../../src/tree/sort.js";

describe("sort", () => {
  test("sorts keys", async () => {
    const tree = {
      b: 2,
      c: 3,
      a: 1,
    };
    const sorted = await sort.call(null, tree);
    assert.deepEqual(Array.from(await sorted.keys()), ["a", "b", "c"]);
  });

  test("invokes a sortKey function", async () => {
    const tree = {
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    };
    const sorted = await sort.call(null, tree, {
      sortKey: (value) => value.age,
    });
    assert.deepEqual(Array.from(await sorted.keys()), [
      "Bob",
      "Carol",
      "Alice",
    ]);
  });
});
