import assert from "node:assert";
import { describe, test } from "node:test";
import values from "../../src/operations/values.js";

describe("values", () => {
  test("returns the tree's values as an array", async () => {
    const fixture = {
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    };
    assert.deepEqual(await values(fixture), [
      "Hello, **Alice**.",
      "Hello, **Bob**.",
      "Hello, **Carol**.",
    ]);
  });
});
