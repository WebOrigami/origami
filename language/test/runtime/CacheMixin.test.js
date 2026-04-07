import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import { cache } from "../../src/runtime/CacheMixin.js";
import CalcMap from "../../src/runtime/CalcMap.js";

describe("CacheMixin", () => {
  beforeEach(() => {
    cache.clear();
  });

  test("tracks dependencies across different maps", async () => {
    // Don't assign `path`, let maps get auto-assigned unique paths
    const map1 = new CalcMap({
      async a() {
        const b = await map2.get("b");
        return b + 1;
      },
    });

    const map2 = new CalcMap({
      async b() {
        return 2;
      },
    });

    const result = await map1.get("a");
    assert.strictEqual(result, 3);
    assert.deepEqual(cacheEntries(), [
      ["_map0/a", { value: 3 }],
      ["_map1/b", { value: 2, downstreams: ["_map0/a"] }],
    ]);

    map1.cache.clear(); // clean up for next test
  });

  test("caches values and records dependencies", async () => {
    // { a = 2 * b, b = c + 1, c = 3 }
    let log = [];
    const fixture = new CalcMap({
      async a() {
        log.push("a");
        const b = await fixture.get("b");
        return 2 * b;
      },

      async b() {
        log.push("b");
        const c = await fixture.get("c");
        return c + 1;
      },

      async c() {
        log.push("c");
        return 3;
      },
    });
    fixture.path = "fixture";

    const result = await Tree.plain(fixture);
    assert.deepEqual(result, {
      a: 8,
      b: 4,
      c: 3,
    });

    assert.deepEqual(cacheEntries(), [
      ["fixture/a", { value: 8 }],
      [
        "fixture/b",
        {
          value: 4,
          downstreams: ["fixture/a"],
        },
      ],
      [
        "fixture/c",
        {
          value: 3,
          downstreams: ["fixture/b"],
        },
      ],
    ]);
    assert.deepEqual(log, ["a", "b", "c"]);

    log = [];
    const a1 = await fixture.get("a");
    assert.strictEqual(a1, 8);
    assert.deepEqual(log, []); // a is cached, no new calcs

    // Replace formula for a
    // { a = 3 * b, b = c + 1, c = 3 }
    fixture.set("a", async () => {
      log.push("a");
      const b = await fixture.get("b");
      return 3 * b;
    });
    log = [];
    const a2 = await fixture.get("a");
    assert.strictEqual(a2, 12);
    assert.deepEqual(log, ["a"]); // recalc only a

    // Replace formula for b
    // { a = 3 * b, b = c + 10, c = 3 }
    fixture.set("b", async () => {
      log.push("b");
      const c = await fixture.get("c");
      return c + 10;
    });
    log = [];
    const a3 = await fixture.get("a");
    assert.strictEqual(a3, 39);
    assert.deepEqual(log, ["a", "b"]); // recalc a and b

    // Replace value of c with 100
    // { a = 3 * b, b = c + 10, c = 100 }
    fixture.set("c", async () => {
      log.push("c");
      return 100;
    });
    log = [];
    const a4 = await fixture.get("a");
    assert.strictEqual(a4, 330);
    assert.deepEqual(log, ["a", "b", "c"]); // recalc all
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

export function cacheEntries() {
  const entries = [...cache.entries()];
  return entries.map(([key, entry]) => [key, cacheEntry(entry)]);
}

export function cacheEntry(entry) {
  const { downstreams, value } = entry;

  const result = { value };
  if (downstreams?.size > 0) {
    result.downstreams = [...downstreams];
  }

  // if (entry.upstreams?.size > 0) {
  //   result.upstreams = [...entry.upstreams.entries()].map(
  //     ([sourceMap, keySet]) => [sourceMap, [...keySet.values()]],
  //   );
  // }

  return result;
}
