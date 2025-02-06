import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import { traceSymbol } from "../../src/runtime/symbols.js";

describe("addTrace", () => {
  test("adds trace structure to results", async () => {
    const source = `{
  f: (x) => x + 1
  g: 2 * f/(3)
}`;
    const program = compile.expression(source);
    const object = await program.call(null);
    const result = await object.g;
    assert.strictEqual(result.valueOf(), 8);
    const trace = result[traceSymbol];
    assert.deepEqual(trace, {
      result: 8,
      source: {
        fragments: [
          {
            text: "2 * ",
          },
          {
            path: "/0",
            text: "f/(3)",
          },
        ],
      },
      inputs: [
        {
          result: 4,
          source: {
            fragments: [
              {
                path: "/0/0",
                text: "x",
              },
              {
                text: " + 1",
              },
            ],
          },
          inputs: [
            {
              result: 3,
            },
          ],
        },
      ],
    });
  });
});
