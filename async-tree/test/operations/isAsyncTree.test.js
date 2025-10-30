import assert from "node:assert";
import { describe, test } from "node:test";
import isMap from "../../src/operations/isMap.js";

describe("isMap", () => {
  test("returns true if the object is a tree", () => {
    const missingGetAndKeys = {};
    assert(!isMap(missingGetAndKeys));

    const missingIterator = {
      async get() {},
    };
    assert(!isMap(missingIterator));

    const missingGet = {
      async *keys() {},
    };
    assert(!isMap(missingGet));

    const hasGetAndKeys = {
      async get() {},
      async *keys() {},
    };
    assert(isMap(hasGetAndKeys));
  });
});
