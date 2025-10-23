import assert from "node:assert";
import { describe, test } from "node:test";
import keys from "../../src/operations/keys.js";
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
    const treeKeys = await keys(result);
    assert.deepEqual(treeKeys.sort(), Object.keys(obj).sort());
  });
});
