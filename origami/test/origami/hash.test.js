import assert from "node:assert";
import { describe, test } from "node:test";
import hash from "../../src/origami/hash.js";

describe("hash", () => {
  test("returns a hash", async () => {
    const data = "test";
    const result = hash(data);
    assert(result instanceof Uint8Array);
    assert.strictEqual(
      result.toString(),
      "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    );
  });
});
