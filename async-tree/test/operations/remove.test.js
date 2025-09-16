import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import plain from "../../src/operations/plain.js";
import remove from "../../src/operations/remove.js";

describe("remove", () => {
  test("removes a value", async () => {
    const fixture = new ObjectTree({
      "Alice.md": "Hello, **Alice**.",
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    });
    await remove(fixture, "Alice.md");
    assert.deepEqual(await plain(fixture), {
      "Bob.md": "Hello, **Bob**.",
      "Carol.md": "Hello, **Carol**.",
    });
  });
});
