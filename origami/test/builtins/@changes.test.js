import assert from "node:assert";
import { describe, test } from "node:test";
import changes from "../../src/builtins/@changes.js";

describe("@changes", () => {
  test("finds changes in two trees", async () => {
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
    const result = await changes.call(null, oldTree, newTree);
    assert.deepEqual(result, {
      a: {
        b: "changed",
        d: "deleted",
      },
      e: "added",
    });
  });
});
