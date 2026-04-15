import { ObjectMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import ScopeMap from "../../src/runtime/ScopeMap.js";

describe("scope", () => {
  test("gets the first defined value from the scope trees", async () => {
    const outer = new ObjectMap({
      a: 1,
      b: 2,
    });
    const inner = new ObjectMap({
      a: 3,
    });
    inner.parent = outer;
    const innerScope = new ScopeMap(inner);
    assert.deepEqual([...innerScope.keys()], ["a", "b"]);
    // Inner tree has precedence
    assert.equal(innerScope.get("a"), 3);
    // If tree doesn't have value, finds value from parent
    assert.equal(innerScope.get("b"), 2);
    assert.equal(innerScope.get("c"), undefined);
    assert.deepEqual(/** @type {any} */ (innerScope).trees, [inner, outer]);
  });
});
