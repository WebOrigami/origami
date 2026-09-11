import assert from "node:assert";
import { describe, test } from "node:test";
import resolvePath from "../../src/utilities/resolvePath.js";

describe("resolvePath", () => {
  test("resolves relative paths", () => {
    assert.equal(resolvePath("a", "b"), "a/b");
    assert.equal(resolvePath("a/b/c", ".", "d"), "a/b/c/d");
    assert.equal(resolvePath("a", "b", "..", "c"), "a/c");
  });

  test("resolve absolute paths", () => {
    assert.equal(resolvePath("/a", "b"), "/a/b");
    assert.equal(resolvePath("/a", ".."), "/");
    assert.equal(resolvePath("a/b/c", ".", "d/e/f"), "a/b/c/d/e/f");
    assert.equal(resolvePath("/a", "b", "..", "c"), "/a/c");
    assert.equal(resolvePath("/a", "..", ".."), "/");
  });

  test("returns null when traversing to or above an initial relative path", () => {
    assert.equal(resolvePath("a", ".."), null);
    assert.equal(resolvePath("a/b", "..", ".."), null);
    assert.equal(resolvePath(".", "a", ".."), null);
  });
});
