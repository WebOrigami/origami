import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import { traceSymbol } from "../../src/runtime/symbols.js";

describe("addTrace", () => {
  test("adds trace structure to results", async () => {
    const source = `
      {
        f: (x) => x + 1
        g: 2 * f/(3)
      }
    `;
    const program = compile.expression(source);
    const object = await program.call(null);
    const result = await object.g;
    assert.strictEqual(result.valueOf(), 8);
    const trace = result[traceSymbol];
    assert.deepStrictEqual(trace, {
      value: 8,
      source: {
        text: source,
      },
      intermediates: [
        {
          value: 2,
        },
        {
          value: 4,
          intermediates: [
            {
              value: 3,
              intermediates: [{ value: "x" }],
            },
            {
              value: 1,
            },
          ],
        },
      ],
    });
  });
});
