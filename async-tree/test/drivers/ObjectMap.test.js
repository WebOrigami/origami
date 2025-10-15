import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectMap from "../../src/drivers/ObjectMap.js";
import * as symbols from "../../src/symbols.js";

describe("ObjectMap", () => {
  test("can get the keys of the tree", () => {
    const fixture = createFixture();
    assert.deepEqual(Array.from(fixture.keys()), [
      "Alice.md",
      "Bob.md",
      "Carol.md",
    ]);
  });

  test("can get the value for a key", () => {
    const map = createFixture();
    const alice = map.get("Alice.md");
    assert.equal(alice, "Hello, **Alice**.");
  });

  test("getting an unsupported key returns undefined", () => {
    const map = createFixture();
    assert.equal(map.get("xyz"), undefined);
  });

  test("getting a null/undefined key throws an exception", async () => {
    const map = createFixture();
    await assert.rejects(async () => {
      map.get(null);
    });
    await assert.rejects(async () => {
      map.get(undefined);
    });
  });

  test("can set a value", () => {
    const map = new ObjectMap({
      a: 1,
      b: 2,
      c: 3,
    });

    // Update existing key
    map.set("a", 4);

    // Delete key
    map.delete("b");

    // Overwrite key with trailing slash
    map.set("c/", {});

    // New key
    map.set("d", 5);

    const entries = Array.from(map.entries());
    assert.deepEqual(entries, [
      ["a", 4],
      ["c/", {}],
      ["d", 5],
    ]);
  });

  test("can wrap a class instance", () => {
    class Foo {
      constructor() {
        this.a = 1;
      }

      get prop() {
        return this._prop;
      }
      set prop(prop) {
        this._prop = prop;
      }
    }
    class Bar extends Foo {
      method() {}
    }
    const bar = new Bar();
    /** @type {any} */ (bar).extra = "Hello";

    const map = new ObjectMap(bar);
    const entries = Array.from(map.entries());
    assert.deepEqual(entries, [
      ["a", 1],
      ["extra", "Hello"],
      ["prop", undefined],
    ]);
    assert.equal(map.get("a"), 1);
    map.set("prop", "Goodbye");
    assert.equal(bar.prop, "Goodbye");
    assert.equal(map.get("prop"), "Goodbye");
  });

  test("sets parent symbol on subobjects", () => {
    const map = new ObjectMap({
      sub: {},
    });
    const sub = map.get("sub");
    assert.equal(sub[symbols.parent], map);
  });

  test("sets parent on subtrees", () => {
    const map = new ObjectMap({
      a: 1,
      more: new ObjectMap({
        b: 2,
      }),
    });
    const more = map.get("more");
    assert.equal(more.parent, map);
  });

  test("adds trailing slashes to keys for subtrees", () => {
    const map = new ObjectMap({
      a1: 1,
      a2: new ObjectMap({
        b1: 2,
      }),
      a3: 3,
      a4: new ObjectMap({
        b2: 4,
      }),
    });
    const keys = Array.from(map.keys());
    assert.deepEqual(keys, ["a1", "a2/", "a3", "a4/"]);
  });

  test("can retrieve values with optional trailing slash", () => {
    const subMap = {
      get(key) {},
      keys() {},
    };
    const map = new ObjectMap({
      a: 1,
      subMap,
    });
    assert.equal(map.get("a"), 1);
    assert.equal(map.get("a/"), 1);
    assert.equal(map.get("subMap"), subMap);
    assert.equal(map.get("subMap/"), subMap);
  });

  test("method on an object is bound to the object", () => {
    const n = new Number(123);
    const map = new ObjectMap(n);
    const method = map.get("toString");
    assert.equal(method(), "123");
  });

  test("defers to symbols.keys for keys if defined", () => {
    const map = new ObjectMap({
      [symbols.keys]: () => ["a", "b", "c"],
    });
    assert.deepEqual(Array.from(map.keys()), ["a", "b", "c"]);
  });
});

function createFixture() {
  return new ObjectMap({
    "Alice.md": "Hello, **Alice**.",
    "Bob.md": "Hello, **Bob**.",
    "Carol.md": "Hello, **Carol**.",
  });
}
