import assert from "node:assert";
import { describe, test } from "node:test";
import hash from "../../src/utilities/hash.js";

describe("hash", () => {
  test("returns a hash", async () => {
    const result = hash("test");
    assert.strictEqual(result, "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3");
  });
});
