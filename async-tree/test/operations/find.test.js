import assert from "node:assert";
import { describe, test } from "node:test";
import find from "../../src/operations/find.js";

describe("find", () => {
  test("returns the first value that satisfies the predicate", async () => {
    const result = await find([5, 12, 8], (e) => e > 10);
    assert.strictEqual(result, 12);
  });
});
