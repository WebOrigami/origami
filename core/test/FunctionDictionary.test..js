import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionDictionary from "../src/FunctionDictionary.js";
import * as Graph from "../src/Graph.js";

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

  test("getting default value returns the function itself", async () => {
    const fn = () => true;
    const fixture = new FunctionDictionary(fn);
    assert.equal(await fixture.get(Graph.defaultValueKey), fn);
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = createFixture();
    assert.equal(await fixture.get("xyz"), undefined);
  });
});

function createFixture() {
  return new FunctionDictionary(
    (key) => {
      if (key?.endsWith?.(".md")) {
        const name = key.slice(0, -3);
        return `Hello, **${name}**.`;
      }
      return undefined;
    },
    ["Alice.md", "Bob.md", "Carol.md"]
  );
}
