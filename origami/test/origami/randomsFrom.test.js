import assert from "node:assert";
import { describe, test } from "node:test";
import randomsFrom from "../../src/origami/randomsFrom.js";

describe("randomsFrom", () => {
  test("returns a predictable sequence for a given seed", async () => {
    const fn = randomsFrom("test");
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(fn());
    }
    assert.deepStrictEqual(
      results,
      [2201614437, 1370285562, 2222320052, 1842227055, 2226658765],
    );
  });
});
