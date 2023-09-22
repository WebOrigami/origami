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
});

function createFixture() {
  return new FunctionGraph((a, b, c) => a + b + c);
}
