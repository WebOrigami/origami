import { Tree } from "@weborigami/async-tree";
import { ExpressionTree, expressionFunction, ops } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import merge from "../../src/builtins/@merge.js";

describe("@merge", () => {
  test("merges trees", async () => {
    const tree = await merge.call(
      null,
      {
        a: 1,
        b: 2,
      },
      {
        c: 3,
        d: 4,
      }
    );
    // @ts-ignore
    assert.deepEqual(await Tree.plain(tree), {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });
  });

  test("puts all trees in scope", async () => {
    const tree = await merge.call(
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
});
