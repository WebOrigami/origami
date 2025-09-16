import assert from "node:assert";
import { describe, test } from "node:test";
import pathFromKeys from "../../src/utilities/pathFromKeys.js";

describe("pathFromKeys", () => {
  test("returns a slash-separated path from keys", () => {
    assert.equal(pathFromKeys([]), "");
    assert.equal(pathFromKeys(["a", "b", "c"]), "a/b/c");
    assert.equal(pathFromKeys(["a/", "b/", "c"]), "a/b/c");
    assert.equal(pathFromKeys(["a/", "b/", "c/"]), "a/b/c/");
  });
});
