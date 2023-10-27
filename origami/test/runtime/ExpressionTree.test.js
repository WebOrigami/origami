import assert from "node:assert";
import { describe, test } from "node:test";

import { Tree } from "@graphorigami/core";
import { createExpressionFunction } from "../../src/language/expressionFunction.js";
import ExpressionTree from "../../src/runtime/ExpressionTree.js";
import * as ops from "../../src/runtime/ops.js";

describe("ExpressionTree", () => {
  test("evaluates expressions, returns other values as is", async () => {
    const tree = new ExpressionTree({
      name: "Alice",
      message: createExpressionFunction([
        ops.concat,
        "Hello, ",
        [ops.scope, "name"],
        "!",
      ]),
    });
    assert.deepEqual(await Tree.plain(tree), {
      name: "Alice",
      message: "Hello, Alice!",
    });
  });
});
