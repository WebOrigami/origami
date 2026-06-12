import assert from "node:assert";
import { describe, test } from "node:test";
import findKey from "../../src/operations/findKey.js";

describe("findKey", () => {
  test("returns the first key that satisfies the predicate", async () => {
    const object = {
      a: 5,
      b: 12,
      c: 8,
    };
    const result = await findKey(object, (e) => e > 10);
    assert.strictEqual(result, "b");
  });
});
