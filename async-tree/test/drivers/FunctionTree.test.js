import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionTree from "../../src/drivers/FunctionTree.js";

describe.skip("FunctionTree", async () => {
  test("can get the keys of the tree", async () => {
    const fixture = createFixture();
    assert.deepEqual(Array.from(await fixture.keys()), [
      "Alice.md",
      "Bob.md",
      "Carol.md",
    ]);
  });

  test("can get the value for a key", async () => {
    const fixture = createFixture();
    const alice = await fixture.get("Alice.md");
    assert.equal(alice, "Hello, **Alice**.");
  });

  test("getting a value from function with multiple arguments curries the function", async () => {
    const fixture = new FunctionTree((a, b, c) => a + b + c);
    const fnA = await fixture.get(1);
    const fnAB = await fnA.get(2);
    const result = await fnAB.get(3);
    assert.equal(result, 6);
  });

  test("getting an unsupported key returns undefined", async () => {
    const fixture = createFixture();
    assert.equal(await fixture.get("xyz"), undefined);
  });
});

function createFixture() {
  return new FunctionTree(
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
