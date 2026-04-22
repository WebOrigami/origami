import { ObjectMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import ScopeMap from "../../src/runtime/ScopeMap.js";
import SyncCacheTransform from "../../src/runtime/SyncCacheTransform.js";
import systemCache from "../../src/runtime/systemCache.js";

describe("scope", () => {
  test("gets the first defined value from the scope trees", async () => {
    class SyncCacheObjectMap extends SyncCacheTransform(ObjectMap) {}

    /** @type {any} */
    const outer = new SyncCacheObjectMap({
      a: 1,
      b: 2,
    });
    outer.path = "outer";

    /** @type {any} */
    const inner = new SyncCacheObjectMap({
      a: 3,
    });
    inner.path = "outer/inner";

    inner.parent = outer;
    const innerScope = new ScopeMap(inner);

    // Inner tree has precedence
    const a = systemCache.getOrInsertComputed("test/a", () =>
      innerScope.get("a"),
    );
    assert.equal(a, 3);

    // If tree doesn't have value, finds value from parent
    const b = systemCache.getOrInsertComputed("test/b", () =>
      innerScope.get("b"),
    );
    assert.equal(b, 2);

    const c = systemCache.getOrInsertComputed("test/c", () =>
      innerScope.get("c"),
    );
    assert.equal(c, undefined);

    assert.deepEqual([...innerScope.keys()], ["a", "b"]);
    assert.deepEqual(/** @type {any} */ (innerScope).trees, [inner, outer]);
  });
});
