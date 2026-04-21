import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import systemCache from "../../src/runtime/systemCache.js";

// We test SyncCacheTransform via syncCalcs since it's a fairly small
// application of the transform.
import syncCalcs from "../../src/runtime/syncCalcs.js";

describe("SyncCacheTransform", () => {
  beforeEach(() => {
    systemCache.clear();
  });

  test("caches values and records dependencies", () => {
    // { a = 2 * b, b = c + 1, c = 3 }
    let log = [];
    const { calcs, data } = syncCalcs([
      [
        "a",
        () => {
          log.push("a");
          const b = calcs.get("b");
          return 2 * b;
        },
      ],
      [
        "b",
        () => {
          log.push("b");
          const c = calcs.get("c");
          return c + 1;
        },
      ],
      [
        "c",
        () => {
          log.push("c");
          return 3;
        },
      ],
    ]);

    assert.deepEqual(
      [...calcs.entries()],
      [
        ["a", 8],
        ["b", 4],
        ["c", 3],
      ],
    );
    assert.deepEqual(log, ["a", "b", "c"]);

    log = [];
    const a1 = calcs.get("a");
    assert.strictEqual(a1, 8);
    assert.deepEqual(log, []); // a is cached, no new calcs

    // Replace formula for a
    // { a = 3 * b, b = c + 1, c = 3 }
    data.set("a", () => {
      log.push("a");
      const b = calcs.get("b");
      return 3 * b;
    });
    log = [];
    const a2 = calcs.get("a");
    assert.strictEqual(a2, 12);
    assert.deepEqual(log, ["a"]); // recalc only a

    // Replace formula for b
    // { a = 3 * b, b = c + 10, c = 3 }
    data.set("b", () => {
      log.push("b");
      const c = calcs.get("c");
      return c + 10;
    });
    log = [];
    const a3 = calcs.get("a");
    assert.strictEqual(a3, 39);
    assert.deepEqual(log, ["a", "b"]); // recalc a and b

    // Replace value of c
    // { a = 3 * b, b = c + 10, c = 100 }
    data.set("c", () => {
      log.push("c");
      return 100;
    });
    log = [];
    const a4 = calcs.get("a");
    assert.strictEqual(a4, 330);
    assert.deepEqual(log, ["a", "b", "c"]); // recalc all
  });
});
