import assert from "node:assert";
import { describe, test } from "node:test";
import { from, ObjectMap, SetMap, SyncMap } from "../../src/internal.js";
import values from "../../src/operations/values.js";
import * as symbols from "../../src/symbols.js";

describe("from", () => {
  test("upgrades a standard Map to a SyncMap", async () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    const tree = from(map);
    assert(tree instanceof SyncMap);
  });

  test("returns a custom Map subclass instance as is", async () => {
    class CustomMap extends Map {}
    const map = new CustomMap([
      ["a", 1],
      ["b", 2],
    ]);
    const tree = from(map);
    assert(tree instanceof CustomMap);
  });

  test("returns a deep object map if deep option is true", async () => {
    const obj = {
      sub: {
        a: 1,
      },
    };
    const tree = from(obj, { deep: true });
    assert(tree instanceof ObjectMap);
    assert(tree.deep);
  });

  test("returns a deep object map if object has [deep] symbol set", async () => {
    const obj = {
      sub: {
        a: 1,
      },
    };
    Object.defineProperty(obj, symbols.deep, { value: true });
    const tree = from(obj);
    assert(tree instanceof ObjectMap);
    assert(tree.deep);
  });

  test("returns a SetMap for Set objects", async () => {
    const set = new Set(["a", "b", "c"]);
    const map = from(set);
    assert(map instanceof SetMap);
    assert.deepEqual(await values(map), ["a", "b", "c"]);
  });

  test("returns an array for an Iterator", async () => {
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

  test("upgrades object with get/keys to a Map", () => {
    const object = {
      get(key) {
        return key.toUpperCase();
      },

      *keys() {
        yield "a";
        yield "b";
      },
    };
    const tree = from(object);
    // @ts-ignore
    assert.deepEqual([...tree.keys()], ["a", "b"]);
    assert.equal(tree.get("a"), "A");
    assert.equal(tree.get("b"), "B");
  });
});
