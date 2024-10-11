import assert from "node:assert";
import { describe, test } from "node:test";
import taggedTemplate from "../../src/runtime/taggedTemplate.js";

describe("taggedTemplate", () => {
  test("joins strings and values together", () => {
    const result = taggedTemplate`a ${"b"} c`;
    assert.equal(result, "a b c");
  });
});
