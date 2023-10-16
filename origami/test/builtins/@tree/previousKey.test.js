import assert from "node:assert";
import { describe, test } from "node:test";
import previousKey from "../../../src/builtins/@tree/previousKey.js";

describe("@tree/previousKey", () => {
  test("gets the previous key in the tree", async () => {
    const tree = {
      a: null,
      b: null,
      c: null,
    };
    assert.equal(await previousKey.call(null, tree, "a"), undefined);
    assert.equal(await previousKey.call(null, tree, "b"), "a");
    assert.equal(await previousKey.call(null, tree, "c"), "b");
  });
});
