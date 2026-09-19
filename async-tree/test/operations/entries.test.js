import assert from "node:assert";
import { describe, test } from "node:test";
import entries from "../../src/operations/entries.js";

describe("entries", () => {
  test("returns the [key, value] pairs of a sync map", () => {
    const fixture = {
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    };
    assert.deepEqual(entries(fixture), [
      ["Alice.md", "Hello, **Alice**."],
      ["Bob.md", "Hello, **Bob**."],
      ["Carol.md", "Hello, **Carol**."],
    ]);
  });

  test("returns the [key, value] pairs of an async map", async () => {
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
