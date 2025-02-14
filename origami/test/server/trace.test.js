import { toPlainValue } from "@weborigami/async-tree";
import { taggedTemplateIndent as indent } from "@weborigami/language";
import * as compile from "@weborigami/language/src/compiler/compile.js";
import assert from "node:assert";
import { describe, test } from "node:test";
import { resultDecomposition, traceHtml } from "../../src/server/trace.js";

describe("trace", () => {
  test("constructs trace links and result decomposition", async () => {
    const source = indent`{
      f: (x) => x + 1
      g: 2 * f/(3)
    }`;
    const program = compile.expression(source);
    const object = await program.call(null);
    const result = await object.g;
    assert.strictEqual(result.valueOf(), 8);
    const html = traceHtml(result, "/test");
    assert.deepEqual(
      html,
      indent`
        <!-- 2 * f/(3) -->
        <debug-context href="/test">
          <debug-link href="/test">
            2 * 
            <debug-link href="/test/0/-">
              ⎆
              <debug-link href="/test/0">
                f/(3)
              </debug-link>
            </debug-link>
          </debug-link>
        </debug-context>
        <!-- x + 1 -->
        <debug-context href="/test/0/-">
          <debug-link href="/test/0/-">
            <debug-link href="/test/0/-/0">
              x
            </debug-link>
             + 1
          </debug-link>
        </debug-context>
      `
    );
    const results = resultDecomposition(result);
    assert.deepEqual(await toPlainValue(results), {
      value: 8,
      0: {
        value: 4,
        "-": {
          // call to f
          value: 4,
          0: {
            value: 3,
          },
        },
      },
    });
  });
});
