import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import indent from "../../src/runtime/taggedTemplateIndent.js";
import { lastTrace } from "../../src/runtime/tracing.js";

describe("tracing", () => {
  test("evaluating code records last result and trace", async () => {
    const source = indent`{
      f: (x) => x + 1
      g = 2 * f/(3)
    }`;
    const program = compile.expression(source);
    const object = await program.call(null);
    const result = await object.g;
    assert.strictEqual(result, 8);
    const trace = lastTrace(result);
    const results = resultsOnly(trace);
    assert.deepEqual(results, {
      expression: "2 * f/(3)",
      inputs: [
        ,
        ,
        {
          call: {
            expression: "x + 1",
            inputs: [, { expression: "x", result: 3 }],
            result: 4,
          },
          expression: "f/(3)",
          inputs: [
            {
              call: {
                expression: "f",
                result: "«function»",
              },
              expression: "f/",
              inputs: [, { expression: "f", result: "«function»" }],
              result: "«function»",
            },
          ],
          result: 4,
        },
      ],
      result: 8,
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
