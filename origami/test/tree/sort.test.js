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
});
