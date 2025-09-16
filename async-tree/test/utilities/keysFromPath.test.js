import assert from "node:assert";
import { describe, test } from "node:test";
import keysFromPath from "../../src/utilities/keysFromPath.js";

describe("keysFromPath", () => {
  test("returns the keys from a slash-separated path", () => {
    assert.deepEqual(keysFromPath(""), []);
    assert.deepEqual(keysFromPath("/"), []);
    assert.deepEqual(keysFromPath("a/b/c"), ["a/", "b/", "c"]);
    assert.deepEqual(keysFromPath("a/b/c/"), ["a/", "b/", "c/"]);
    assert.deepEqual(keysFromPath("/foo/"), ["foo/"]);
    assert.deepEqual(keysFromPath("a///b"), ["a/", "b"]);
  });
});
