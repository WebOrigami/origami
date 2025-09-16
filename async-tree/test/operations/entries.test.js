import assert from "node:assert";
import { describe, test } from "node:test";
import entries from "../../src/operations/entries.js";

describe("entries", () => {
  test("entries() returns the [key, value] pairs", async () => {
    const fixture = {
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    };
    assert.deepEqual(Array.from(await entries(fixture)), [
      ["Alice.md", "Hello, **Alice**."],
      ["Bob.md", "Hello, **Bob**."],
      ["Carol.md", "Hello, **Carol**."],
    ]);
  });
});
