import assert from "node:assert";
import { describe, test } from "node:test";
import shuffle from "../../src/operations/shuffle.js";

describe("shuffle", () => {
  test("shuffles the keys of a tree", async () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
    };
    const result = await shuffle(obj);
    const keys = Array.from(await result.keys());
    assert.deepEqual(keys.sort(), Object.keys(obj).sort());
  });
});
