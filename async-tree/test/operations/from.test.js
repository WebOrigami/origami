import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectMap from "../../src/drivers/DeepObjectMap.js";
import SetMap from "../../src/drivers/SetMap.js";
import from from "../../src/operations/from.js";
import values from "../../src/operations/values.js";
import * as symbols from "../../src/symbols.js";

describe("from", () => {
  test("returns a Map as is", async () => {
    const tree1 = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const tree2 = from(tree1);
    assert.equal(tree2, tree1);
  });

  test("returns a deep object map if deep option is true", async () => {
    const obj = {
      sub: {
        a: 1,
      },
    };
    const tree = from(obj, { deep: true });
    assert(tree instanceof DeepObjectMap);
  });

  test("returns a deep object map if object has [deep] symbol set", async () => {
    const obj = {
      sub: {
        a: 1,
      },
    };
    Object.defineProperty(obj, symbols.deep, { value: true });
    const tree = from(obj);
    assert(tree instanceof DeepObjectMap);
  });

  test("returns a SetMap for Set objects", async () => {
    const set = new Set(["a", "b", "c"]);
    const map = from(set);
    assert(map instanceof SetMap);
    assert.deepEqual(await values(map), ["a", "b", "c"]);
  });

  test.only("returns an array for an Iterator", async () => {
    const set = new Set(["a", "b", "c"]);
    const map = from(set.values());
    assert.deepEqual(await values(map), ["a", "b", "c"]);
  });

  test("autoboxes primitive values", async () => {
    const tree = from("Hello, world.");
    const slice = await tree.get("slice");
    const result = await slice(0, 5);
    assert.equal(result, "Hello");
  });
});
