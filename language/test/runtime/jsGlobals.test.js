import assert from "node:assert";
import { describe, test } from "node:test";
import jsGlobals from "../../src/runtime/jsGlobals.js";

describe("jsGlobals", () => {
  test("wraps static methods to drop the call target", async () => {
    const { Promise: fixture } = jsGlobals;
    const target = {};
    const promise = fixture.resolve.call(target, "hi");
    const value = await promise;
    assert.equal(value, "hi");
  });

  test("can invoke a global constructor", async () => {
    const { Number: fixture } = jsGlobals;
    // Without `new`
    const instance1 = fixture(5);
    assert.equal(instance1, 5);
    // With `new`
    const instance = new fixture();
    assert(instance instanceof Number);
  });
});
