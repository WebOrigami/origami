import { ObjectTree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import InheritScopeTransform from "../../src/framework/InheritScopeTransform.js";

describe("InheritScopeTransform", () => {
  test("creates a scope that includes a tree and its parent", async () => {
    const fixture = new (InheritScopeTransform(ObjectTree))({
      b: 2,
    });
    fixture.parent2 = new ObjectTree({
      a: 1,
    });
    assert.deepEqual(await fixture.scope?.get("b"), 2);
    assert.deepEqual(await fixture.scope?.get("a"), 1);
  });

  test("adds a subtree's parent to the subtrees's scope", async () => {
    const fixture = new (InheritScopeTransform(ObjectTree))({
      a: 1,
      subtree: {
        b: 2,
      },
    });
    const subtree = await fixture.get("subtree");
    assert.deepEqual(await subtree.scope.get("b"), 2);
    assert.deepEqual(await subtree.scope.get("a"), 1);
  });
});
