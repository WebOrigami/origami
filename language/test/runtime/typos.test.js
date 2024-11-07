import assert from "node:assert";
import { describe, test } from "node:test";
import { isTypo, typos } from "../../src/runtime/typos.js";

describe("typos", () => {
  test("isTypo", () => {
    assert(isTypo("cat", "bat")); // substitution
    assert(isTypo("cat", "cats")); // insertion
    assert(isTypo("cat", "cast")); // insertion
    assert(isTypo("cat", "at")); // deletion
    assert(isTypo("cat", "ca")); // deletion
    assert(isTypo("cat", "cta")); // transposition
    assert(isTypo("cat", "act")); // transposition
    assert(!isTypo("cat", "dog")); // more than 1 edit
  });

  test("typos", () => {
    const result = typos("cas", ["ask", "cat", "cast", "cats", "cart"]);
    assert.deepEqual(result, ["cat", "cast", "cats"]);
  });
});
