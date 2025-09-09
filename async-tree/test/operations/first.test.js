import assert from "node:assert";
import { describe, test } from "node:test";
import first from "../../src/operations/first.js";

describe("first", () => {
  test("returns the first value in the tree", async () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };
    const result = await first(obj);
    assert.equal(result, 1);
  });
});
