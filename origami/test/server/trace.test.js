import { toPlainValue } from "@weborigami/async-tree";
import * as compile from "@weborigami/language/src/compiler/compile.js";
import assert from "node:assert";
import { describe, test } from "node:test";
import { resultDecomposition, traceLinks } from "../../src/server/trace.js";

describe("trace", () => {
  test("constructs trace links and result decomposition", async () => {
    const source = `{
  f: (x) => x + 1
  g: 2 * f/(3)
}`;
    const program = compile.expression(source);
    const object = await program.call(null);
    const result = await object.g;
    assert.strictEqual(result.valueOf(), 8);
    const links = traceLinks(result);
    assert.deepStrictEqual(links, {
      value: [
        {
          text: "  2 * ",
        },
        {
          path: "/0",
          text: "f/(3)",
        },
      ],
      0: {
        value: [
          { text: "  " },
          {
            path: "/0/0",
            text: "x",
          },
          { text: " + 1" },
        ],
        0: {
          value: [{ text: "x" }],
        },
      },
    });
    const results = resultDecomposition(result);
    assert.deepEqual(await toPlainValue(results), {
      value: 8,
      0: {
        value: 4,
        0: {
          value: 3,
        },
      },
    });
  });
});
