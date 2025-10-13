import assert from "node:assert";
import { describe, test } from "node:test";
import jsGlobals from "../../src/project/jsGlobals.js";

describe("jsGlobals", () => {
  test("wraps static methods to bind them to defining object", async () => {
    const all = jsGlobals.Promise.all;
    const value = await all([Promise.resolve("hi")]);
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
