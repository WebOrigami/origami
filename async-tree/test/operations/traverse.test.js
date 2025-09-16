import assert from "node:assert";
import { describe, test } from "node:test";
import MapTree from "../../src/drivers/MapTree.js";
import ObjectTree from "../../src/drivers/ObjectTree.js";
import traverse from "../../src/operations/traverse.js";

describe("traverse", () => {
  test("traverses a path of keys", async () => {
    const tree = new ObjectTree({
      a1: 1,
      a2: {
        b1: 2,
        b2: {
          c1: 3,
          c2: 4,
        },
      },
    });
    assert.equal(await traverse(tree), tree);
    assert.equal(await traverse(tree, "a1"), 1);
    assert.equal(await traverse(tree, "a2", "b2", "c2"), 4);
    assert.equal(await traverse(tree, "a2", "doesntexist", "c2"), undefined);
  });

  test("traverses a function with fixed number of arguments", async () => {
    const tree = (a, b) => ({
      c: "Result",
    });
    assert.equal(await traverse(tree, "a", "b", "c"), "Result");
  });

  test("traverses from one tree into another", async () => {
    const tree = new ObjectTree({
      a: {
        b: new MapTree([
          ["c", "Hello"],
          ["d", "Goodbye"],
        ]),
      },
    });
    assert.equal(await traverse(tree, "a", "b", "c"), "Hello");
  });
});
