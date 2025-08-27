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
});
