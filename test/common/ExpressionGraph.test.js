import ExpressionGraph from "../../src/common/ExpressionGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import Expression from "../../src/language/Expression.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

describe("ExpressionGraph", () => {
  it("evaluates expressions, returns other values as is", async () => {
    const graph = new ExpressionGraph({
      name: "Alice",
      message: new Expression([
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
