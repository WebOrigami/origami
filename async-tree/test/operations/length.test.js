import assert from "node:assert";
import { describe, test } from "node:test";
import length from "../../src/operations/length.js";

describe("length", () => {
  test("returns the number of keys in the tree", async () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };
    const result = await length(obj);
    assert.equal(result, 3);
  });
});
