import { DeepObjectTree, ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import InheritScopeMixin from "../../src/runtime/InheritScopeMixin.js";

describe("InheritScopeMixin", () => {
  test("creates a scope that includes a tree and its parent", async () => {
    const fixture = new (InheritScopeMixin(ObjectTree))({
      b: 2,
    });
    fixture.parent = new ObjectTree({
      a: 1,
    });
    assert.deepEqual(await fixture.scope?.get("b"), 2);
    assert.deepEqual(await fixture.scope?.get("a"), 1);
  });

  test("adds a subtree's parent to the subtrees's scope", async () => {
    const fixture = new (InheritScopeMixin(DeepObjectTree))({
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
