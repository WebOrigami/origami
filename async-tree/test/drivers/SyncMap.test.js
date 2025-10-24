import assert from "node:assert";
import { describe, test } from "node:test";
import SyncMap from "../../src/drivers/SyncMap.js";

describe("SyncMap", () => {
  test("passes instanceof Map", () => {
    const map = new SyncMap();
    assert(map instanceof Map);
  });

  test("can be constructed with an iterable", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    assert.strictEqual(map.size, 2);
    assert.strictEqual(map.get("a"), 1);
    assert.strictEqual(map.get("b"), 2);
  });

  test("can be constructed with another SyncMap", () => {
    const map1 = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const map2 = new SyncMap(map1);
    const entries = Array.from(map2.entries());
    assert.deepStrictEqual(entries, [
      ["a", 1],
      ["b", 2],
    ]);
  });

  test("clear", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    assert.strictEqual(map.size, 2);
    map.clear();
    assert.strictEqual(map.size, 0);
  });

  test("delete", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    assert.strictEqual(map.size, 2);
    assert.strictEqual(map.delete("a"), true);
    assert.strictEqual(map.size, 1);
    assert.strictEqual(map.get("a"), undefined);
    assert.strictEqual(map.delete("a"), false);
    assert.strictEqual(map.size, 1);
  });

  test("delete on read-only map throws", () => {
    class Fixture extends SyncMap {
      get(key) {
        return super.get(key);
      }
    }
    const map = new Fixture([
      ["a", 1],
      ["b", 2],
    ]);
    assert.throws(() => map.delete("a"), {
      name: "Error",
      message: "delete() can't be called on a read-only map",
    });
  });

  test("entries", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const entries = Array.from(map.entries());
    assert.deepStrictEqual(entries, [
      ["a", 1],
      ["b", 2],
    ]);
  });

  test("forEach", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const calls = [];
    map.forEach((value, key, theMap) => {
      calls.push([key, value, theMap]);
    });
    assert.deepStrictEqual(calls, [
      ["a", 1, map],
      ["b", 2, map],
    ]);
  });

  test("get", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    assert.strictEqual(map.get("a"), 1);
    assert.strictEqual(map.get("b"), 2);
    assert.strictEqual(map.get("c"), undefined);
  });

  test("get with trailing slash", () => {
    const subMap = new SyncMap();
    const map = new SyncMap([
      ["a", 1],
      ["b/", subMap],
    ]);
    assert.strictEqual(map.get("a"), 1);

    const b = map.get("b/");
    assert.strictEqual(b, subMap);
    assert.strictEqual(b.parent, map);

    // Trailing slash optional
    assert.strictEqual(map.get("b"), subMap);

    assert.strictEqual(map.get("c"), undefined);
  });

  test("has returns true if key exists in keys()", () => {
    const map = new SyncMap();
    map.keys = () => {
      return ["a", "b/"][Symbol.iterator]();
    };
    assert.strictEqual(map.has("a"), true);
    assert.strictEqual(map.has("b"), true); // trailing slash optional
    assert.strictEqual(map.has("b/"), true);
    assert.strictEqual(map.has("c"), false);
  });

  test("readOnly if get() is overridden but not delete() and set()", () => {
    const map4 = new SyncMap();
    assert.strictEqual(map4.readOnly, false);

    class ReadOnly1 extends SyncMap {
      get(key) {
        return super.get(key);
      }
    }
    const map1 = new ReadOnly1();
    assert.strictEqual(map1.readOnly, true);

    class ReadOnly2 extends SyncMap {
      get(key) {
        return super.get(key);
      }
      set(key, value) {
        return super.set(key, value);
      }
    }
    const map2 = new ReadOnly2();
    assert.strictEqual(map2.readOnly, true);

    class ReadWrite extends SyncMap {
      get(key) {
        return super.get(key);
      }
      set(key, value) {
        return super.set(key, value);
      }
      delete(key) {
        return super.delete(key);
      }
    }
    const map3 = new ReadWrite();
    assert.strictEqual(map3.readOnly, false);
  });

  test("Symbol.iterator", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const entries = Array.from(map[Symbol.iterator]());
    assert.deepStrictEqual(entries, [
      ["a", 1],
      ["b", 2],
    ]);
  });

  test("keys", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const keys = Array.from(map.keys());
    assert.deepStrictEqual(keys, ["a", "b"]);
  });

  test("set", () => {
    const map = new SyncMap();
    assert.strictEqual(map.size, 0);
    map.set("a", 1);
    assert.strictEqual(map.size, 1);
    assert.strictEqual(map.get("a"), 1);
    map.set("a", 2);
    assert.strictEqual(map.size, 1);
    assert.strictEqual(map.get("a"), 2);
    map.set("b", 3);
    assert.strictEqual(map.size, 2);
    assert.strictEqual(map.get("b"), 3);
  });

  test("set with EMPTY value creates empty subtree", () => {
    const map = new SyncMap();
    map.set("subtree", SyncMap.EMPTY);
    const subtree = map.get("subtree");
    assert(subtree instanceof SyncMap);
    assert.strictEqual(subtree.size, 0);
  });

  test("set on read-only map throws", () => {
    class Fixture extends SyncMap {
      get(key) {
        return super.get(key);
      }
    }
    const map = new Fixture();
    assert.throws(() => map.set("a", 1), {
      name: "Error",
      message: "set() can't be called on a read-only map",
    });
  });

  test("size", () => {
    const map = new SyncMap();
    assert.strictEqual(map.size, 0);
    map.set("a", 1);
    assert.strictEqual(map.size, 1);
    map.set("b", 2);
    assert.strictEqual(map.size, 2);
    map.delete("a");
    assert.strictEqual(map.size, 1);
    map.clear();
    assert.strictEqual(map.size, 0);
  });

  test("values", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const values = Array.from(map.values());
    assert.deepStrictEqual(values, [1, 2]);
  });

  test("all methods work with prototype chain extension", () => {
    const map = new SyncMap([
      ["a", 1],
      ["b", 2],
    ]);
    const map2 = Object.create(map);
    assert.strictEqual(map2.get("a"), 1);
    assert.strictEqual(map2.has("b"), true);
    assert.strictEqual(map2.size, 2);

    const entries = Array.from(map2.entries());
    assert.deepStrictEqual(entries, [
      ["a", 1],
      ["b", 2],
    ]);

    const keys = Array.from(map2.keys());
    assert.deepStrictEqual(keys, ["a", "b"]);

    const values = Array.from(map2.values());
    assert.deepStrictEqual(values, [1, 2]);

    const iteratedEntries = Array.from(map2[Symbol.iterator]());
    assert.deepStrictEqual(iteratedEntries, [
      ["a", 1],
      ["b", 2],
    ]);

    const forEachCalls = [];
    map2.forEach((value, key, thisArg) => {
      forEachCalls.push([key, value, thisArg]);
    });
    assert.deepStrictEqual(forEachCalls, [
      ["a", 1, map2],
      ["b", 2, map2],
    ]);
  });
});
