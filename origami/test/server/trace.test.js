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
        <section data-prefix="/test">
          <span data-href="/test">2 * <span data-href="/test/0/-">⎆<span data-href="/test/0">f/(3)</span></span></span>
        </section>
        <!-- x + 1 -->
        <section data-prefix="/test/0/-">
          <span data-href="/test/0/-"><span data-href="/test/0/-/0">x</span> + 1</span>
        </section>
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
