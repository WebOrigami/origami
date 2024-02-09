import { FunctionTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import Scope2 from "../../src/runtime/Scope2.js";

describe("Scope2", () => {
  test("caches values", async () => {
    // A tree { a: 1 } that tracks how many times its get method is called.
    let count = 0;
    const tree = new FunctionTree(
      (key) => {
        count++;
        return key === "a" ? 1 : undefined;
      },
      ["a"]
    );

    const scope = new Scope2(tree);
    assert.deepEqual([...(await scope.keys())], ["a"]);
    assert.equal(await scope.get("a"), 1);
    assert.equal(await scope.get("a"), 1);
    assert.equal(count, 1);
    assert.equal(await scope.get("b"), undefined);
    assert.deepEqual(scope.cache, { a: 1, b: undefined });
  });

  test("can rely on a base scope", async () => {
    const baseScope = new Scope2({ a: 1 });
    const scope = new Scope2({ b: 2 }, baseScope);
    assert.equal(await scope.get("a"), 1);
    assert.equal(await scope.get("b"), 2);
    assert.equal(await scope.get("c"), undefined);
    assert.deepEqual(scope.cache, { b: 2 });
    assert.deepEqual(baseScope.cache, { a: 1, c: undefined });
  });
});
