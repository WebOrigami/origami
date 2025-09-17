import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import { default as del } from "../../src/operations/delete.js";
import plain from "../../src/operations/plain.js";

describe("delete", () => {
  test("removes a value", async () => {
    const fixture = new ObjectTree({
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    });
    await del(fixture, "Alice.md");
    assert.deepEqual(await plain(fixture), {
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    });
  });
});
