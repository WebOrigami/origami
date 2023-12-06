import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import arrowFunctionsMap from "../../src/common/arrowFunctionsMap.js";

describe("arrowFunctionsMap", () => {
  test("interprets ← in a key maps value to a function", async () => {
    const fn = () => 2;
    const tree = new ObjectTree({
      x: 1,
      "y ← fn": fn,
    });
    const arrows = arrowFunctionsMap()(tree);
    assert.deepEqual([...(await arrows.keys())], ["x", "y"]);
    assert.equal(await arrows.get("x"), 1);
    const yFn = await arrows.get("y");
    assert.equal(yFn, fn);
  });
});
