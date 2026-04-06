import { SyncMap, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import CacheMixin from "../../src/runtime/CacheMixin.js";

// Makes it easier to define a map whose values invoke async functions
class InvokeFunctionsMap extends SyncMap {
  constructor(object) {
    const entries = Object.entries(object);
    super(entries);
    this.log = [];
  }

  async get(key) {
    let value = await super.get(key);
    if (typeof value === "function") {
      value = await value();
    }
    this.log.push(key);
    return value;
  }
}
class CalcMap extends CacheMixin(InvokeFunctionsMap) {}

describe("CacheMixin", () => {
  test("caches values and records dependencies", async () => {
    // { a = 2 * b, b = c + 1, c = 3 }
    const fixture = new CalcMap({
      async a() {
        const b = await fixture.get("b");
        return 2 * b;
      },

      async b() {
        const c = await fixture.get("c");
        return c + 1;
      },

      async c() {
        return 3;
      },
    });

    const result = await Tree.plain(fixture);
    assert.deepEqual(result, {
      a: 8,
      b: 4,
      c: 3,
    });

    assert.deepEqual(cacheEntries(fixture), [
      ["a", { value: 8 }],
      [
        "b",
        {
          value: 4,
          downstreams: [[fixture, ["a"]]],
        },
      ],
      [
        "c",
        {
          value: 3,
          downstreams: [[fixture, ["b"]]],
        },
      ],
    ]);
    assert.deepEqual(fixture.log, ["c", "b", "a"]);

    const a1 = await fixture.get("a");
    assert.strictEqual(a1, 8);
    assert.deepEqual(fixture.log, ["c", "b", "a"]); // a is cached, no new calcs

    // Replace formula for a
    // { a = 3 * b, b = c + 1, c = 3 }
    fixture.set("a", async () => {
      const b = await fixture.get("b");
      return 3 * b;
    });
    fixture.log = [];
    const a2 = await fixture.get("a");
    assert.strictEqual(a2, 12);
    assert.deepEqual(fixture.log, ["a"]); // recalc a

    // Replace formula for b
    // { a = 3 * b, b = c + 10, c = 3 }
    fixture.set("b", async () => {
      const c = await fixture.get("c");
      return c + 10;
    });
    fixture.log = [];
    const a3 = await fixture.get("a");
    assert.strictEqual(a3, 39);
    assert.deepEqual(fixture.log, ["b", "a"]); // recalc a and b

    // Replace value of c with 100
    // { a = 3 * b, b = c + 10, c = 100 }
    fixture.set("c", 100);
    fixture.log = [];
    const a4 = await fixture.get("a");
    assert.strictEqual(a4, 330);
    assert.deepEqual(fixture.log, ["c", "b", "a"]); // recalc c, b, a
  });

  // test("records dependencies for async calls", async () => {
  //   const c = (input) => input.toUpperCase();

  //   const fixture = new CalcMap({
  //     async site() {
  //       const a = await fixture.get("a");
  //       const b = await fixture.get("b");
  //       return {
  //         a,
  //         b,
  //       };
  //     },

  //     async a() {
  //       const c = await fixture.get("c");
  //       return c("a");
  //     },

  //     async b() {
  //       const c = await fixture.get("c");
  //       return c("b");
  //     },

  //     async c() {
  //       return c;
  //     },
  //   });

  //   const site = await fixture.get("site");
  //   const result = await Tree.plain(site);
  //   assert.deepEqual(result, {
  //     a: "A",
  //     b: "B",
  //   });
  //   const entries = cacheEntries(/** @type {any} */ (fixture).cache);
  //   assert.deepStrictEqual(entries, [
  //     ["site", { value: { a: "A", b: "B" } }],
  //     ["a", { downstreams: [[fixture, ["site"]]], value: "A" }],
  //     ["c", { downstreams: [[fixture, ["a", "b"]]], value: c }],
  //     ["b", { downstreams: [[fixture, ["site"]]], value: "B" }],
  //   ]);
  // });
});

export function cacheEntries(fixture) {
  const cache = fixture.cache;
  const entries = [...cache.entries()];
  return entries.map(([key, entry]) => [key, cacheEntry(entry)]);
}

export function cacheEntry(entry) {
  const { downstreams, value } = entry;

  const result = { value };
  if (downstreams?.size > 0) {
    result.downstreams = [...downstreams.entries()].map(
      ([sourceMap, keySet]) => [sourceMap, [...keySet.values()]],
    );
  }

  if (entry.upstreams?.size > 0) {
    result.upstreams = [...entry.upstreams.entries()].map(
      ([sourceMap, keySet]) => [sourceMap, [...keySet.values()]],
    );
  }

  return result;
}
