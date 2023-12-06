import assert from "node:assert";
import { describe, test } from "node:test";

import { Tree } from "@weborigami/async-tree";
import {
  ExpressionTree,
  expressionFunction,
  ops,
} from "../../src/runtime/internal.js";

describe("ExpressionTree", () => {
  test("evaluates expressions, returns other values as is", async () => {
    const tree = new ExpressionTree({
      name: "Alice",
      message: expressionFunction.createExpressionFunction([
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
