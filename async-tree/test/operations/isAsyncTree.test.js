import assert from "node:assert";
import { describe, test } from "node:test";
import isAsyncTree from "../../src/operations/isAsyncTree.js";

describe("isAsyncTree", () => {
  test("returns true if the object is a tree", () => {
    const missingGetAndKeys = {};
    assert(!isAsyncTree(missingGetAndKeys));

    const missingIterator = {
      async get() {},
    };
    assert(!isAsyncTree(missingIterator));

    const missingGet = {
      async *keys() {},
    };
    assert(!isAsyncTree(missingGet));

    const hasGetAndKeys = {
      async get() {},
      async *keys() {},
    };
    assert(isAsyncTree(hasGetAndKeys));
  });
});
