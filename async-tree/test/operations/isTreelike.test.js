import assert from "node:assert";
import { describe, test } from "node:test";
import isTreelike from "../../src/operations/isTreelike.js";

describe("Fixture name goes here", () => {
  test("isTreelike() returns true if the argument can be cast to an async tree", () => {
    assert(!isTreelike(null));
    assert(isTreelike({}));
    assert(isTreelike([]));
    assert(isTreelike(new Map()));
    assert(isTreelike(new Set()));
  });
});
