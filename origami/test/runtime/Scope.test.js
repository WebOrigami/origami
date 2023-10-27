import assert from "node:assert";
import { describe, test } from "node:test";
import Scope from "../../src/runtime/Scope.js";

describe("Scope", () => {
  test("composes and flattens scopes and trees passed to it", async () => {
    const treeA = {
      a: 1,
    };
    const treeB = {
      b: 2,
    };
    const treeC = {
      c: 3,
    };
    const scope1 = new Scope(treeA, treeB);
    const scope2 = new Scope(scope1, treeC);
    const objects = scope2.trees.map(
      (tree) => /** @type {any} */ (tree).object
    );
    assert.deepEqual(objects, [treeA, treeB, treeC]);
  });

  test("gets the first defined value from the scope trees", async () => {
    const scope = new Scope(
      {
        a: 1,
      },
      {
        a: 2,
        b: 3,
      }
    );
    assert.equal(await scope.get("a"), 1);
    assert.equal(await scope.get("b"), 3);
  });
});
