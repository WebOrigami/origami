import assert from "node:assert";
import { describe, test } from "node:test";
import deepText from "../../src/operations/deepText.js";

describe("deepText", () => {
  test("joins strings and values together", async () => {
    const array = [1, 2, 3];
    const object = { person1: "Alice", person2: "Bob" };
    const result = await deepText`a ${array} b ${object} c`;
    assert.equal(result, "a 123 b AliceBob c");
  });
});
