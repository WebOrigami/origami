import assert from "node:assert";
import { describe, test } from "node:test";
import keys from "../../src/operations/keys.js";

describe("keys", () => {
  test("returns the keys of a tree as an array", async () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };
    const result = await keys(obj);
    assert.deepEqual(result, ["a", "b", "c"]);
  });
});
