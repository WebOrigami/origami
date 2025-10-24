import assert from "node:assert";
import { describe, test } from "node:test";
import AsyncMap from "../../src/drivers/AsyncMap.js";
import SampleAsyncMap from "../SampleAsyncMap.js";

describe("AsyncMap", () => {
  test("clear", async () => {
    const map = new SampleAsyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    assert.strictEqual(await map.size, 2);
    await map.clear();
    assert.strictEqual(await map.size, 0);
  });

  test("entries invokes keys() and get()", async () => {
    const map = new SampleAsyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const entries = [];
    for await (const entry of map.entries()) {
      entries.push(entry);
    }
    assert.deepStrictEqual(entries, [
      ["a", 1],
      ["b", 2],
    ]);
  });

  test("forEach", async () => {
    const map = new SampleAsyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const calls = [];
    await map.forEach(async (value, key, theMap) => {
      calls.push([key, value, theMap]);
    });
    assert.deepStrictEqual(calls, [
      ["a", 1, map],
      ["b", 2, map],
    ]);
  });

  test("has returns true if key exists in keys()", async () => {
    const map = new AsyncMap();
    map.keys = async function* () {
      yield* ["a", "b/"];
    };
    assert.strictEqual(await map.has("a"), true);
    assert.strictEqual(await map.has("b"), true); // trailing slash optional
    assert.strictEqual(await map.has("b/"), true);
    assert.strictEqual(await map.has("c"), false);
  });

  test("instanceof returns true for both Map and AsyncMap", () => {
    assert(new Map() instanceof AsyncMap);
    assert(new AsyncMap() instanceof AsyncMap);
    assert(!(new Object() instanceof AsyncMap));
  });

  test("readOnly if get() is overridden but not delete() and set()", () => {
    const map1 = new SampleAsyncMap();
    map1.get = async (key) => null;
    assert.strictEqual(map1.readOnly, true);

    const map2 = new SampleAsyncMap();
    assert.strictEqual(map2.readOnly, false);
  });

  test("size", async () => {
    const map = new SampleAsyncMap();
    assert.strictEqual(await map.size, 0);
    await map.set("a", 1);
    assert.strictEqual(await map.size, 1);
    await map.set("b", 2);
    assert.strictEqual(await map.size, 2);
    await map.delete("a");
    assert.strictEqual(await map.size, 1);
    await map.clear();
    assert.strictEqual(await map.size, 0);
  });

  test("values", async () => {
    const map = new SampleAsyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const values = [];
    for await (const value of map.values()) {
      values.push(value);
    }
    assert.deepStrictEqual(values, [1, 2]);
  });
});
