import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import calcs from "../../src/runtime/calcs.js";
import systemCache from "../../src/runtime/systemCache.js";

describe("CacheMixin", () => {
  beforeEach(() => {
    systemCache.clear();
  });

  test("tracks dependencies across different maps", async () => {
    // Don't assign `path`, let maps get auto-assigned unique paths
    const map1 = await calcs({
      async a() {
        const b = await map2.get("b");
        return b + 1;
      },
    });

    const map2 = await calcs({
      async b() {
        return 2;
      },
    });

    const result = await map1.get("a");
    assert.strictEqual(result, 3);
  });

  test("caches values and records dependencies", async () => {
    // { a = 2 * b, b = c + 1, c = 3 }
    let log = [];
    const fixture = await calcs({
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
});
