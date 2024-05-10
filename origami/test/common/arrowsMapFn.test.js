import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import arrowsMapFn from "../../src/common/arrowsMapFn.js";

describe("arrowsMapFn", () => {
  test("interprets ← in a key maps value to a function", async () => {
    const fn = () => 2;
    const tree = new ObjectTree({
      x: 1,
      "y ← fn": fn,
    });
    const arrows = arrowsMapFn()(tree);
    assert.deepEqual(Array.from(await arrows.keys()), ["x", "y"]);
    assert.equal(await arrows.get("x"), 1);
    const yFn = await arrows.get("y");
    assert.equal(yFn, fn);
  });
});
