import assert from "node:assert";
import { describe, test } from "node:test";
import MapBase from "../../src/drivers/MapBase.js";

describe("MapBase", () => {
  test("passes instanceof Map", () => {
    class Fixture extends MapBase {}
    const map = new Fixture();
    assert(map instanceof Map);
  });

  test("can be constructed with an iterable", () => {
    class Fixture extends MapBase {}
    const map = new Fixture([
      ["a", 1],
      ["b", 2],
    ]);
    assert.strictEqual(map.size, 2);
    assert.strictEqual(map.get("a"), 1);
    assert.strictEqual(map.get("b"), 2);
  });

  test("clear", () => {
    class Fixture extends MapBase {}
    const map = new Fixture([
      ["a", 1],
      ["b", 2],
    ]);
    assert.strictEqual(map.size, 2);
    map.clear();
    assert.strictEqual(map.size, 0);
  });

  test("delete", () => {
    class Fixture extends MapBase {}
    const map = new Fixture([
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
    class Fixture extends MapBase {
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
    class Fixture extends MapBase {}
    const map = new Fixture([
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
    class Fixture extends MapBase {}
    const map = new Fixture([
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
    class Fixture extends MapBase {}
    const map = new Fixture([
      ["a", 1],
      ["b", 2],
    ]);
    assert.strictEqual(map.get("a"), 1);
    assert.strictEqual(map.get("b"), 2);
    assert.strictEqual(map.get("c"), undefined);
  });

  test("has", () => {
    class Fixture extends MapBase {}
    const map = new Fixture([
      ["a", 1],
      ["b/", 2],
    ]);
    assert.strictEqual(map.has("a"), true);
    assert.strictEqual(map.has("b"), true); // trailing slash optional
    assert.strictEqual(map.has("b/"), true);
    assert.strictEqual(map.has("c"), false);
  });

  test("isReadOnly if get() is overridden but not delete() and set()", () => {
    class NoOverrides extends MapBase {}
    const map4 = new NoOverrides();
    assert.strictEqual(map4.isReadOnly, false);

    class ReadOnly1 extends MapBase {
      get(key) {
        return super.get(key);
      }
    }
    const map1 = new ReadOnly1();
    assert.strictEqual(map1.isReadOnly, true);

    class ReadOnly2 extends MapBase {
      get(key) {
        return super.get(key);
      }
      set(key, value) {
        return super.set(key, value);
      }
    }
    const map2 = new ReadOnly2();
    assert.strictEqual(map2.isReadOnly, true);

    class ReadWrite extends MapBase {
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
    assert.strictEqual(map3.isReadOnly, false);
  });

  test("Symbol.iterator", () => {
    class Fixture extends MapBase {}
    const map = new Fixture([
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
    class Fixture extends MapBase {}
    const map = new Fixture([
      ["a", 1],
      ["b", 2],
    ]);
    const keys = Array.from(map.keys());
    assert.deepStrictEqual(keys, ["a", "b"]);
  });

  test("set", () => {
    class Fixture extends MapBase {}
    const map = new Fixture();
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

  test("set on read-only map throws", () => {
    class Fixture extends MapBase {
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
    class Fixture extends MapBase {}
    const map = new Fixture();
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
    class Fixture extends MapBase {}
    const map = new Fixture([
      ["a", 1],
      ["b", 2],
    ]);
    const values = Array.from(map.values());
    assert.deepStrictEqual(values, [1, 2]);
  });
});
