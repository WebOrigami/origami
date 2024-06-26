import assert from "node:assert";
import { describe, test } from "node:test";
import deepStrings from "../../src/operations/deepStrings.js";

describe("deepStrings", () => {
  test("returns an async iterator of the tree's values as strings", async () => {
    const tree = {
      a: 1,
      b: "2",
      c: async () => 3,
      d: {
        e: 4,
      },
      f: null,
    };
    const values = [];
    for await (const value of await deepStrings(tree)) {
      values.push(value);
    }
    assert.deepEqual(values, ["1", "2", "3", "4"]);
  });
});
