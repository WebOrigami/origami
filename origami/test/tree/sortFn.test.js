import assert from "node:assert";
import { describe, test } from "node:test";
import sortFn from "../../src/tree/sortFn.js";

describe("@sortFn", () => {
  test("invokes a sortKey function", async () => {
    const tree = {
      Alice: { age: 48 },
      Bob: { age: 36 },
      Carol: { age: 42 },
    };
    const transform = await sortFn.call(null, {
      sortKey: (value) => value.age,
    });
    const result = transform(tree);
    assert.deepEqual(Array.from(await result.keys()), [
      "Bob",
      "Carol",
      "Alice",
    ]);
  });
});
