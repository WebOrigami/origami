import assertBuiltin from "../../src/builtins/assert.js";
import ExpressionGraph from "../../src/common/ExpressionGraph.js";
import InvokeFunctionsTransform from "../../src/common/InvokeFunctionsTransform.js";
import InheritScopeTransform from "../../src/framework/InheritScopeTransform.js";
import { createExpressionFunction } from "../../src/language/expressionFunction.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

describe("assert", () => {
  it("returns undefined if actual value equals expected value", async () => {
    const result = await assertBuiltin.call(null, {
      description: "Should pass",
      expected: "foo",
      actual: "foo",
    });
    assert.strictEqual(result, undefined);
  });

  it("returns record if actual value doesn't equal expected value", async () => {
    const result = await assertBuiltin.call(null, {
      description: "Shouldn't pass",
      expected: "foo",
      actual: "bar",
    });
    assert.deepEqual(result, {
      description: "Shouldn't pass",
      expected: "foo",
      actual: "bar",
    });
  });

  it("gives fixture graph a default scope of builtins before evaluating", async () => {
    const graph = new (InheritScopeTransform(
      InvokeFunctionsTransform(ExpressionGraph)
    ))({
      description: "keys builtin returns keys",
      expected: ["a", "b", "c"],
      actual: createExpressionFunction([
        [ops.scope, "keys"],
        [ops.scope, "fixture"],
      ]),
      fixture: {
        a: 1,
        b: 2,
        c: 3,
      },
    });
    const result = await assertBuiltin.call(null, graph);
    assert.strictEqual(result, undefined);
  });
});
