import assert from "node:assert";
import { describe, test } from "node:test";
import hash from "../../src/origami/hash.js";

describe("hash", () => {
  test("returns a hash", async () => {
    const result = hash("test");
    assert.strictEqual(result, "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b");
  });
});
