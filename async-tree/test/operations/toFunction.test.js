import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import toFunction from "../../src/operations/toFunction.js";

describe("toFunction", () => {
  test("returns a function that invokes a tree's get() method", async () => {
    const tree = new ObjectTree({
      a: 1,
      b: 2,
    });
    const fn = await toFunction(tree);
    assert.equal(await fn("a"), 1);
    assert.equal(await fn("b"), 2);
  });
});
