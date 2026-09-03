import assert from "node:assert";
import { describe, test } from "node:test";
import combine from "../../src/operations/combine.js";
import plain from "../../src/operations/plain.js";

describe("combine", () => {
  test("combines two trees", async () => {
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
    const combined = await combine(oldTree, newTree, compareFn);
    assert(combined);
    assert.deepEqual(await plain(combined), {
      a: {
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
