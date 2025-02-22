import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import indent from "../../src/runtime/taggedTemplateIndent.js";
import { traceOrigamiCode } from "../../src/runtime/trace.js";

describe("trace", () => {
  test("trace basic math", async () => {
    const source = indent`2 * (3 + 1)`;
    const program = compile.expression(source);
    const { result, trace } = await traceOrigamiCode.call(
      null,
      program.code,
      true
    );
    assert.strictEqual(result, 8);
    const results = await resultsOnly(trace);
    assert.deepEqual(results, {
      expression: "2 * (3 + 1)",
      inputs: [
        undefined,
        undefined,
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
    const results = await resultsOnly(trace);
    assert.deepEqual(results, {
      call: {
        expression: "x + 1",
        inputs: [undefined, { expression: "x", result: 1 }],
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

  test("trace object literal", async () => {
    const program = compile.expression(indent`
      {
        a: 1 + 1
        b = a
      }`);
    const { result, trace } = await traceOrigamiCode.call(
      null,
      program.code,
      true
    );
    assert.deepEqual(await Tree.plain(result), {
      a: 2,
      b: 2,
    });
    const results = await resultsOnly(trace);
    assert.deepEqual(results, {
      expression: "{ a: 1 + 1 b = a }",
      inputs: [
        {
          expression: "1 + 1",
          result: 2,
        },
      ],
      result: {
        a: 2,
        b: 2,
      },
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
    const results = await resultsOnly(trace);
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
async function resultsOnly(trace) {
  const result =
    typeof trace.result === "function"
      ? "«function»"
      : Tree.isTreelike(trace.result)
      ? await Tree.plain(trace.result)
      : await trace.result;
  const filtered = {
    expression: trace.expression,
    result,
  };
  if (trace.inputs?.length > 0) {
    filtered.inputs = await Promise.all(trace.inputs.map(resultsOnly));
  }
  if (trace.call) {
    filtered.call = await resultsOnly(trace.call);
  }
  return filtered;
}
