import assert from "node:assert";
import { describe, test } from "node:test";

import { GraphHelpers } from "@graphorigami/core";
import ExpressionGraph from "../../src/common/ExpressionGraph.js";
import { createExpressionFunction } from "../../src/language/expressionFunction.js";
import * as ops from "../../src/language/ops.js";

describe("ExpressionGraph", () => {
  test("evaluates expressions, returns other values as is", async () => {
    const graph = new ExpressionGraph({
      name: "Alice",
      message: createExpressionFunction([
        ops.concat,
        "Hello, ",
        [ops.scope, "name"],
        "!",
      ]),
    });
    assert.deepEqual(await GraphHelpers.plain(graph), {
      name: "Alice",
      message: "Hello, Alice!",
    });
  });
});
