import assert from "node:assert";
import { describe, test } from "node:test";
import ExpressionGraph from "../../src/common/ExpressionGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
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
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      name: "Alice",
      message: "Hello, Alice!",
    });
  });
});
