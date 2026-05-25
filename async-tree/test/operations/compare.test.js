import assert from "node:assert";
import { describe, test } from "node:test";
import compare from "../../src/operations/compare.js";

describe("compare", () => {
  test("compares two trees", async () => {
    const oldTree = {
      a: {
        b: "old",
        c: "old",
        d: "old",
      },
    };
    const newTree = {
      a: {
        b: "new",
        c: "old",
      },
      e: "new",
    };
    const comparison = await compare(oldTree, newTree, compareFn);
    assert.deepEqual(comparison, {
      "a/": {
        b: ["old", "new"],
        c: ["old", "old"],
        d: ["old", undefined],
      },
      e: [undefined, "new"],
    });
  });
});

function compareFn(a, b) {
  return [a, b];
}
