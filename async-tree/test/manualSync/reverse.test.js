import assert from "node:assert";
import { describe, test } from "node:test";
import reverse from "../../src/manualSync/reverse.js";

describe("reverse", () => {
  test("reverses a tree's top-level keys", () => {
    const tree = {
      a: 1,
      b: 2,
      c: 3,
    };
    const reversed = reverse(tree);
    const entries = Array.from(reversed.entries());
    assert.deepEqual(entries, [
      ["c", 3],
      ["b", 2],
      ["a", 1],
    ]);
  });
});
