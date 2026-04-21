import assert from "node:assert";
import { beforeEach, describe, test } from "node:test";
import systemCache from "../../src/runtime/systemCache.js";

// We test AsyncCacheTransform via asyncCalcs since it's a fairly small
// application of the transform.
import { Tree } from "@weborigami/async-tree";
import asyncCalcs from "../../src/runtime/asyncCalcs.js";

describe("AsyncCacheTransform", () => {
  beforeEach(() => {
    systemCache.clear();
  });

  test("caches values and records dependencies", async () => {
    // { a = 2 * b, b = c + 1, c = 3 }
    let log = [];
    const { calcs, data } = asyncCalcs([
      [
        "a",
        async () => {
          log.push("a");
          const b = await calcs.get("b");
          return 2 * b;
        },
      ],
      [
        "b",
        async () => {
          log.push("b");
          const c = await calcs.get("c");
          return c + 1;
        },
      ],
      [
        "c",
        async () => {
          log.push("c");
          return 3;
        },
      ],
    ]);

    assert.deepEqual(await Tree.entries(calcs), [
      ["a", 8],
      ["b", 4],
      ["c", 3],
    ]);
    assert.deepEqual(log, ["a", "b", "c"]);

    log = [];
    const a1 = await calcs.get("a");
    assert.strictEqual(a1, 8);
    assert.deepEqual(log, []); // a is cached, no new calcs

    // Replace formula for a
    // { a = 3 * b, b = c + 1, c = 3 }
    data.set("a", async () => {
      log.push("a");
      const b = await calcs.get("b");
      return 3 * b;
    });
    log = [];
    const a2 = await calcs.get("a");
    assert.strictEqual(a2, 12);
    assert.deepEqual(log, ["a"]); // recalc only a

    // Replace formula for b
    // { a = 3 * b, b = c + 10, c = 3 }
    data.set("b", async () => {
      log.push("b");
      const c = await calcs.get("c");
      return c + 10;
    });
    log = [];
    const a3 = await calcs.get("a");
    assert.strictEqual(a3, 39);
    assert.deepEqual(log, ["a", "b"]); // recalc a and b

    // Replace value of c
    // { a = 3 * b, b = c + 10, c = 100 }
    data.set("c", async () => {
      log.push("c");
      return 100;
    });
    log = [];
    const a4 = await calcs.get("a");
    assert.strictEqual(a4, 330);
    assert.deepEqual(log, ["a", "b", "c"]); // recalc all
  });
});
