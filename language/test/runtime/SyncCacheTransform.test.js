import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import systemCache from "../../src/runtime/systemCache.js";

// We test SyncCacheTransform via SyncCalcMap since it's about the smallest
// functional application of the transform.
import SyncCalcMap from "../../src/runtime/SyncCalcMap.js";

describe("SyncCacheTransform", () => {
  beforeEach(() => {
    systemCache.clear();
  });

  test.only("tracks dependencies", () => {
    // { a = b + 1, b = 1 }
    const map = new SyncCalcMap([
      ["a", () => map.get("b") + 1],
      ["b", 1],
    ]);
    const a1 = map.get("a");
    assert.strictEqual(a1, 2);

    // Replace formula for b
    // { a = b + 1, b = 10 }
    map.set("b", 10);
    const a2 = map.get("a");
    assert.strictEqual(a2, 11);
  });

  test("tracks dependencies across different maps", () => {
    let log = [];

    // Don't assign `path`, let maps get auto-assigned unique paths
    const map1 = new SyncCalcMap({
      a() {
        log.push("a");
        const b = map2.get("b");
        return b + 1;
      },
    });

    const map2 = new SyncCalcMap({
      b() {
        log.push("b");
        return 2;
      },
    });

    const a1 = map1.get("a");
    assert.strictEqual(a1, 3);
    assert.deepEqual(log, ["a", "b"]);

    log = [];
    const a2 = map1.get("a");
    assert.strictEqual(a2, 3);
    assert.deepEqual(log, []); // a is cached, no new calcs
  });

  test("caches values and records dependencies", () => {
    // { a = 2 * b, b = c + 1, c = 3 }
    let log = [];
    const fixture = new SyncCalcMap({
      a() {
        log.push("a");
        const b = fixture.get("b");
        return 2 * b;
      },

      b() {
        log.push("b");
        const c = fixture.get("c");
        return c + 1;
      },

      c() {
        log.push("c");
        return 3;
      },
    });
    fixture.path = "fixture";

    assert.deepEqual(
      [...fixture.entries()],
      [
        ["a", 8],
        ["b", 4],
        ["c", 3],
      ],
    );
    assert.deepEqual(log, ["a", "b", "c"]);

    log = [];
    const a1 = fixture.get("a");
    assert.strictEqual(a1, 8);
    assert.deepEqual(log, []); // a is cached, no new calcs

    // Replace formula for a
    // { a = 3 * b, b = c + 1, c = 3 }
    fixture.set("a", () => {
      log.push("a");
      const b = fixture.get("b");
      return 3 * b;
    });
    log = [];
    const a2 = fixture.get("a");
    assert.strictEqual(a2, 12);
    assert.deepEqual(log, ["a"]); // recalc only a

    // Replace formula for b
    // { a = 3 * b, b = c + 10, c = 3 }
    fixture.set("b", () => {
      log.push("b");
      const c = fixture.get("c");
      return c + 10;
    });
    log = [];
    const a3 = fixture.get("a");
    assert.strictEqual(a3, 39);
    assert.deepEqual(log, ["a", "b"]); // recalc a and b

    // Replace value of c with 100
    // { a = 3 * b, b = c + 10, c = 100 }
    fixture.set("c", () => {
      log.push("c");
      return 100;
    });
    log = [];
    const a4 = fixture.get("a");
    assert.strictEqual(a4, 330);
    assert.deepEqual(log, ["a", "b", "c"]); // recalc all
  });
});
