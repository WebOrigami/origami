import { ObjectTree, toPlainValue } from "@weborigami/async-tree";
import {
  HandleExtensionsTransform,
  taggedTemplateIndent as indent,
} from "@weborigami/language";
import * as compile from "@weborigami/language/src/compiler/compile.js";
import assert from "node:assert";
import { describe, test } from "node:test";
import { builtinsTree } from "../../src/internal.js";
import { resultDecomposition, traceHtml } from "../../src/server/trace.js";

describe("trace", () => {
  test("trace function call", async () => {
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
            <span>2 * </span>
            <debug-link href="/test/0">
              f/(3)
            </debug-link>
          </debug-link>
        </debug-context>
        <!-- x + 1 -->
        <debug-context href="/test/0">
          <debug-link href="/test/0">
            <debug-link href="/test/0/0">
              x
            </debug-link>
            <span> + 1</span>
          </debug-link>
        </debug-context>
      `
    );
    const decomposition = resultDecomposition(result);
    assert.deepEqual(await toPlainValue(decomposition), {
      value: 8,
      0: {
        value: 4,
        0: {
          value: 3,
        },
      },
    });
  });

  test.only("trace template", async () => {
    const context = new (HandleExtensionsTransform(ObjectTree))({
      "greet.ori": "(name) => `Hello, ${name}!`",
    });
    context.parent = builtinsTree;
    const source = `greet.ori("Origami")`;
    const program = compile.expression(source);
    const result = await program.call(context);
    assert.strictEqual(String(result), "Hello, Origami!");
    const decomposition = resultDecomposition(result);
    assert.deepEqual(await toPlainValue(decomposition), {
      value: "Hello, Origami!",
      0: {
        value: "Origami",
      },
    });
  });
});
