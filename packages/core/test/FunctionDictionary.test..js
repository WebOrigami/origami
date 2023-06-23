import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionDictionary from "../src/FunctionDictionary.js";

describe("FunctionDictionary", async () => {
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
  return new FunctionDictionary(
    (key) => {
      if (key.endsWith(".md")) {
        const name = key.slice(0, -3);
        return `Hello, **${name}**.`;
      }
      return undefined;
    },
    ["Alice.md", "Bob.md", "Carol.md"]
  );
}
