import { Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import merge from "../../../src/builtins/@tree/merge.js";
import { createExpressionFunction } from "../../../src/language/expressionFunction.js";
import ExpressionTree from "../../../src/runtime/ExpressionTree.js";
import * as ops from "../../../src/runtime/ops.js";

describe("@tree/merge", () => {
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
        b: createExpressionFunction([ops.scope, "c"]),
      }),
      new ExpressionTree({
        c: 2,
        d: createExpressionFunction([ops.scope, "a"]),
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
