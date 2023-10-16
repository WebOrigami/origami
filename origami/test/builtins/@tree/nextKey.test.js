import assert from "node:assert";
import { describe, test } from "node:test";
import nextKey from "../../../src/builtins/@tree/nextKey.js";

describe("@tree/nextKey", () => {
  test("gets the next key in the tree", async () => {
    const tree = {
      a: null,
      b: null,
      c: null,
    };
    assert.equal(await nextKey.call(null, tree, "a"), "b");
    assert.equal(await nextKey.call(null, tree, "b"), "c");
    assert.equal(await nextKey.call(null, tree, "c"), undefined);
  });
});
