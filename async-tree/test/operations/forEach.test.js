import assert from "node:assert";
import { describe, test } from "node:test";
import forEach from "../../src/operations/forEach.js";

describe("forEach", () => {
  test("invokes a callback for each entry", async () => {
    const fixture = {
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    };
    const results = {};
    await forEach(fixture, async (value, key) => {
      results[key] = value;
    });
    assert.deepEqual(results, {
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    });
  });
});
