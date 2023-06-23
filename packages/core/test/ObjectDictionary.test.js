import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectDictionary from "../src/ObjectDictionary.js";

describe("ObjectDictionary", () => {
  test("can get the keys of the graph", async () => {
    const fixture = createFixture();
    assert.deepEqual(
      [...(await fixture.keys())],
      ["Alice.md", "Bob.md", "Carol.md"]
    );
  });

  test("can get the value for a key", async () => {
    const fixture = createFixture();
    const alice = await fixture.get("Alice.md");
    assert.equal(alice, "Hello, **Alice**.");
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = createFixture();
    assert.equal(await fixture.get("xyz"), undefined);
  });
});

function createFixture() {
  return new ObjectDictionary({
    "Alice.md": "Hello, **Alice**.",
    "Bob.md": "Hello, **Bob**.",
    "Carol.md": "Hello, **Carol**.",
  });
}
