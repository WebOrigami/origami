import assert from "node:assert";
import { describe, test } from "node:test";
import FunctionGraph from "../src/FunctionGraph.js";

describe("FunctionGraph", async () => {
  test("getting a value from function with multiple arguments curries the function", async () => {
    const fixture = createFixture();
    const fnA = await fixture.get(1);
    const fnAB = await fnA.get(2);
    const result = await fnAB.get(3);
    assert.equal(result, 6);
  });

  test("traverse applies function to multiple keys", async () => {
    const fixture = createFixture();
    const result = await fixture.traverse(1, 2, 3);
    assert.equal(result, 6);
  });

  test("partial traverse curries the function", async () => {
    const fixture = createFixture();
    const fnAB = await fixture.traverse(1, 2);
    const result = await fnAB.traverse(3);
    assert.equal(result, 6);
  });

  test("can traverse more keys than the function itself accepts", async () => {
    const fn = (name) => ({
      Hello: `Hello, ${name}!`,
    });
    const fixture = new FunctionGraph(fn);
    const result = await fixture.traverse("Alice", "Hello");
    assert.deepEqual(result, "Hello, Alice!");
  });
});

function createFixture() {
  return new FunctionGraph((a, b, c) => a + b + c);
}
