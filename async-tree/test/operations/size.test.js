import assert from "node:assert";
import { describe, test } from "node:test";
import size from "../../src/operations/size.js";

describe("size", () => {
  test("returns the number of keys in the tree", async () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };
    const result = await size(obj);
    assert.equal(result, 3);
  });
});
