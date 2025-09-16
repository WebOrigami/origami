import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import isAsyncMutableTree from "../../src/operations/isAsyncMutableTree.js";

describe("isAsyncMutableTree", () => {
  test("returns true if the object is a mutable tree", () => {
    assert.equal(
      isAsyncMutableTree({
        get() {},
        keys() {},
      }),
      false
    );
    assert.equal(isAsyncMutableTree(new ObjectTree({})), true);
  });
});
