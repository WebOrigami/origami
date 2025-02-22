import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import indent from "../../src/runtime/taggedTemplateIndent.js";
import { traceOrigamiCode } from "../../src/runtime/tracing.js";

describe("tracing", () => {
  test("trace basic math", async () => {
    const source = indent`2 * (3 + 1)`;
    const program = compile.expression(source);
    const { result, trace } = await traceOrigamiCode.call(
      null,
      program.code,
      true
    );
    assert.strictEqual(result, 8);
    const results = resultsOnly(trace);
    assert.deepEqual(results, {
      expression: "2 * (3 + 1)",
      inputs: [
        ,
        ,
        {
          expression: "(3 + 1)",
          result: 4,
        },
      ],
      result: 8,
    });
  });

  test("trace call of external Origami function", async () => {
    const fnProgram = compile.expression(`(x) => x + 1`);
    const fn = await fnProgram.call(null);
    const parent = new ObjectTree({ fn });
    const program = compile.expression(`fn(1)`);
    const { result, trace } = await traceOrigamiCode.call(
      parent,
      program.code,
      true
    );
    assert.strictEqual(result, 2);
    const results = resultsOnly(trace);
    assert.deepEqual(results, {
      call: {
        expression: "x + 1",
        inputs: [, { expression: "x", result: 1 }],
        result: 2,
      },
      expression: "fn(1)",
      inputs: [
        {
          expression: "fn",
          result: "«function»",
        },
      ],
      result: 2,
    });
  });

  test("trace property access", async () => {
    const objectProgram = compile.expression(indent`
      {
        a: 1,
        b = a
      }
    `);
    const object = await objectProgram.call(null);
    const program = compile.expression(`b`);
    const { result, trace } = await traceOrigamiCode.call(
      object,
      program.code,
      true
    );
    assert.strictEqual(result, 1);
    const results = resultsOnly(trace);
    assert.deepEqual(results, {
      call: {
        call: {
          expression: "a",
          result: 1,
        },
        expression: "b",
        result: 1,
      },
      expression: "b",
      result: 1,
    });
  });
});

// Return only the results from the trace
function resultsOnly(trace) {
  const result =
    typeof trace.result === "function" ? "«function»" : trace.result;
  const filtered = {
    expression: trace.expression,
    result,
  };
  if (trace.inputs?.length > 0) {
    filtered.inputs = trace.inputs.map(resultsOnly);
  }
  if (trace.call) {
    filtered.call = resultsOnly(trace.call);
  }
  return filtered;
}
