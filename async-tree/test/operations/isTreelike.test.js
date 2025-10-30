import assert from "node:assert";
import { describe, test } from "node:test";
import isMaplike from "../../src/operations/isMaplike.js";

describe("Fixture name goes here", () => {
  test("isMaplike() returns true if the argument can be cast to an async tree", () => {
    assert(!isMaplike(null));
    assert(isMaplike({}));
    assert(isMaplike([]));
    assert(isMaplike(new Map()));
    assert(isMaplike(new Set()));
  });
});
