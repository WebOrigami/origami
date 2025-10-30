import assert from "node:assert";
import { describe, test } from "node:test";
import isMaplike from "../../src/operations/isMaplike.js";

describe("isMaplike", () => {
  test("returns true if the argument can be cast to an async map", () => {
    assert(!isMaplike(null));
    assert(!isMaplike(1));
    assert(isMaplike({}));
    assert(isMaplike([]));
    assert(isMaplike(new Map()));
    assert(isMaplike(new Set()));
  });
});
