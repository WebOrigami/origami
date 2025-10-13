import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import mergeTrees from "../../src/runtime/mergeTrees.js";

describe("mergeTrees", () => {
  test("if all arguments are plain objects, result is a plain object", async () => {
    let calledFoo = false;
    let calledBar = false;
    const result = await mergeTrees(
      {
        a: 1,
        b: 2,
        get foo() {
          calledFoo = true;
          return true;
        },
      },
      {
        b: 3,
        c: 4,
        get bar() {
          calledBar = true;
          return true;
        },
      }
    );

    // Shouldn't call functions when just getting keys
    assert.deepEqual(Object.keys(result), ["a", "b", "foo", "c", "bar"]);
    assert(!calledFoo);
    assert(!calledBar);

    assert.deepEqual(result, {
      a: 1,
      b: 3,
      foo: true,
      c: 4,
      bar: true,
    });
  });

  test("merges heterogenous arguments as trees", async () => {
    const tree = await mergeTrees(
      new ObjectTree({
        a: 1,
        b: 2,
      }),
      {
        b: 3,
        c: 4,
      }
    );
    assert.deepEqual(await Tree.plain(tree), {
      a: 1,
      b: 3,
      c: 4,
    });
  });
});
