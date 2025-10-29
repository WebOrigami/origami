import assert from "node:assert";
import { describe, test } from "node:test";
import from from "../../src/operations/from.js";
import json from "../../src/operations/json.js";

describe("json", () => {
  test("renders a tree in JSON format", async () => {
    const tree = from({ person1: "Alice", person2: "Bob" });
    const result = await json(tree);
    assert.equal(
      result,
      `{
  "person1": "Alice",
  "person2": "Bob"
}`
    );
  });
});
