import { Tree } from "@weborigami/async-tree";
import { ExpressionTree, expressionFunction, ops } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import mergeTrees from "../../src/runtime/mergeTrees.js";

describe("mergeTrees", () => {
  test("merges trees", async () => {
    const tree = await mergeTrees.call(
      null,
      {
        a: 1,
        b: 2,
      },
      {
        b: 3,
        c: 4,
      }
    );
    // @ts-ignore
    assert.deepEqual(await Tree.plain(tree), {
      a: 1,
      b: 2,
      c: 4,
    });
  });

  test("puts all trees in scope", async () => {
    const tree = await mergeTrees.call(
      null,
      new ExpressionTree({
        a: 1,
        b: expressionFunction.createExpressionFunction([ops.scope, "c"]),
      }),
      new ExpressionTree({
        c: 2,
        d: expressionFunction.createExpressionFunction([ops.scope, "a"]),
      })
    );
    // @ts-ignore
    assert.deepEqual(await Tree.plain(tree), {
      a: 1,
      b: 2,
      c: 2,
      d: 1,
    });
  });

  test("if all arguments are plain objects, result is a plain object", async () => {
    const result = await mergeTrees.call(
      null,
      {
        a: 1,
        b: 2,
      },
      {
        b: 3,
        c: 4,
      }
    );
    assert.deepEqual(result, {
      a: 1,
      b: 2,
      c: 4,
    });
  });

  test("if all arguments are arrays, result is an array", async () => {
    const result = await mergeTrees.call(null, [1, 2], [3, 4]);
    assert.deepEqual(result, [1, 2, 3, 4]);
  });
});
