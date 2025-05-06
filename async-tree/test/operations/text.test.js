import assert from "node:assert";
import { describe, test } from "node:test";
import text from "../../src/operations/text.js";

describe("text template literal function", () => {
  test("joins strings and values together", async () => {
    const array = [1, 2, 3];
    const object = { person1: "Alice", person2: "Bob" };
    const result = await text`a ${array} b ${object} c`;
    assert.equal(result, "a 123 b AliceBob c");
  });
});
