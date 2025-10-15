import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionMap from "../../src/drivers/FunctionMap.js";

describe("FunctionMap", () => {
  test("keys uses supplied domain", () => {
    const map = createFixture();
    assert.deepEqual(Array.from(map.keys()), [
      "Alice.md",
      "Bob.md",
      "Carol.md",
    ]);
  });

  test("can get the value for a key", () => {
    const map = createFixture();
    const alice = map.get("Alice.md");
    assert.equal(alice, "Hello, **Alice**.");
  });

  test("getting a value from function with multiple arguments curries the function", () => {
    const map = new FunctionMap((a, b, c) => a + b + c);
    const fnA = map.get(1);
    const fnAB = fnA.get(2);
    const result = fnAB.get(3);
    assert.equal(result, 6);
  });

  test("getting an unsupported key returns undefined", () => {
    const fixture = createFixture();
    assert.equal(fixture.get("xyz"), undefined);
  });
});

function createFixture() {
  return new FunctionMap(
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
