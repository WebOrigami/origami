import assert from "node:assert";
import { describe, test } from "node:test";
import jsGlobals from "../../src/project/jsGlobals.js";

describe("jsGlobals", () => {
  test("can invoke static methods", async () => {
    const { Promise } = jsGlobals;
    const { all } = Promise;
    const result = (
      await all(["fruit", "computer", "park"].map((item) => `Apple ${item}`))
    ).join(", ");
    assert.equal(result, "Apple fruit, Apple computer, Apple park");
  });

  test("can invoke a method on a static method", () => {
    const { Math } = jsGlobals;
    const a = [1, 3, 2];
    const b = Math.max.apply(null, a);
    assert.equal(b, 3);
  });
});
