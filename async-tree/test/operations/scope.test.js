import assert from "node:assert";
import { describe, test } from "node:test";
import { ObjectTree } from "../../src/internal.js";
import keys from "../../src/operations/keys.js";
import scope from "../../src/operations/scope.js";

describe("scope", () => {
  test("gets the first defined value from the scope trees", async () => {
    const outer = new ObjectTree({
      a: 1,
      b: 2,
    });
    const inner = new ObjectTree({
      a: 3,
    });
    inner.parent = outer;
    const innerScope = await scope(inner);
    assert.deepEqual(await keys(innerScope), ["a", "b"]);
    // Inner tree has precedence
    assert.equal(await innerScope.get("a"), 3);
    // If tree doesn't have value, finds value from parent
    assert.equal(await innerScope.get("b"), 2);
    assert.equal(await innerScope.get("c"), undefined);
    assert.deepEqual(innerScope.trees, [inner, outer]);
  });
});
