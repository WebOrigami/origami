import assert from "node:assert";
import { describe, test } from "node:test";
import castArraylike from "../../src/utilities/castArraylike.js";

describe("castArraylike", () => {
  test("returns an object if any keys are not integers", () => {
    const map = new /** @type {any} */ (Map)([
      [0, "a"],
      [1, "b"],
      ["x", "c"],
    ]);
    const result = castArraylike(map);
    assert.deepEqual(result, {
      0: "a",
      1: "b",
      x: "c",
    });
  });

  test("returns values as is if keys are numeric and 0..length-1", () => {
    const map = new /** @type {any} */ (Map)([
      [0, "a"],
      [1, "b"],
      [2, "c"],
    ]);
    const result = castArraylike(map);
    assert.deepEqual(result, ["a", "b", "c"]);
  });

  test("order of keys doesn't matter as long as they're all present", () => {
    const map = new /** @type {any} */ (Map)([
      [1, "a"],
      [0, "b"],
      [2, "c"],
    ]);
    const result = castArraylike(map);
    assert.deepEqual(result, ["a", "b", "c"]);
  });

  test("resorts object if numeric keys are missing", () => {
    const map = new /** @type {any} */ (Map)([
      [1, "a"],
      [0, "b"],
      [3, "c"],
    ]);
    const result = castArraylike(map);
    assert.deepEqual(result, {
      1: "a",
      0: "b",
      3: "c",
    });
  });
});
