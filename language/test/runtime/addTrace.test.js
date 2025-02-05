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
      value: 8,
      ...offsets(source, "2 * f/(3)"),
      source: {
        text: source,
      },
      intermediates: [
        {
          value: 2,
        },
        {
          value: 4,
          ...offsets(source, "x + 1"),
          intermediates: [
            {
              value: 3,
              ...offsets(source, "x", 2),
              intermediates: [
                {
                  value: "x",
                },
              ],
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

// Return the start and end offset of the nth occurrence of the fragment within
// the text
function offsets(text, fragment, occurrence = 1) {
  let start = 0;
  for (let i = 0; i < occurrence; i++) {
    start = text.indexOf(fragment, start + 1);
  }
  const end = start + fragment.length;
  return { start, end };
}
