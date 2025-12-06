import assert from "node:assert";
import { describe, test } from "node:test";
import jsGlobals from "../../src/project/jsGlobals.js";

describe("jsGlobals", () => {
  test("can invoke finicky methods like Promise.all that check their receiver", async () => {
    const value = await jsGlobals.Promise.all([Promise.resolve("hi")]);
    assert.equal(value, "hi");
  });

  test("can invoke a static method on a global", () => {
    const { Math } = jsGlobals;
    const a = [1, 3, 2];
    const b = Math.max.apply(null, a);
    assert.equal(b, 3);
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
