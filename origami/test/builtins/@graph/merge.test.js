import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import merge from "../../../src/builtins/@graph/merge.js";
import ExpressionGraph from "../../../src/common/ExpressionGraph.js";
import InheritScopeTransform from "../../../src/framework/InheritScopeTransform.js";
import { createExpressionFunction } from "../../../src/language/expressionFunction.js";
import * as ops from "../../../src/language/ops.js";

describe("@graph/merge", () => {
  test("merges graphs", async () => {
    const graph = await merge.call(
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
    assert.deepEqual(await Graph.plain(graph), {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });
  });

  test("puts all graphs in scope", async () => {
    const graph = await merge.call(
      null,
      new (InheritScopeTransform(ExpressionGraph))({
        a: 1,
        b: createExpressionFunction([ops.scope, "c"]),
      }),
      new (InheritScopeTransform(ExpressionGraph))({
        c: 2,
        d: createExpressionFunction([ops.scope, "a"]),
      })
    );
    // @ts-ignore
    assert.deepEqual(await Graph.plain(graph), {
      a: 1,
      b: 2,
      c: 2,
      d: 1,
    });
  });
});
