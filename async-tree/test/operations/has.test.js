import assert from "node:assert";
import { describe, test } from "node:test";
import has from "../../src/operations/has.js";

describe("has", () => {
  test("has returns true if the key exists", async () => {
    const fixture = {
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    };
    assert.equal(await has(fixture, "Alice.md"), true);
    assert.equal(await has(fixture, "David.md"), false);
  });
});
