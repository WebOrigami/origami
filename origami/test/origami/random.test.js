import assert from "node:assert";
import { describe, test } from "node:test";
import randomFrom from "../../src/origami/randomFrom.js";

describe("random", () => {
  test("returns a pseudo-random 32-bit integer", async () => {
    const result = randomFrom("test");
    assert.strictEqual(result, 2177926815);
  });
});
