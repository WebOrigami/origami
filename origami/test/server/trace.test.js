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

describe.skip("trace", () => {
  test("trace function call", async () => {
    const source = indent`{
      f: (x) => x + 1
      g = 2 * f/(3)
    }`;
    const program = compile.expression(source);
    const object = await program.call(null);
    const result = await object.g;
    assert.strictEqual(result, 8);
    const trace = lastTrace(result);
    const html = await traceHtml(trace, "/");
    assert.deepStrictEqual(
      html,
      indent`
        <ul>
          <li>
            <a href="/result" target="resultPane">
              <code>2 * f/(3)</code>
              <span>8</span>
            </a>
          </li>
          <ul>
            <li>
              <a href="/0/result" target="resultPane">
                <code>f/(3)</code>
                <span>4</span>
              </a>
            </li>
            <ul>
              <div>⋮</div>
              <li>
                <a href="/0/-/result" target="resultPane">
                  <code>f/</code>
                  <span>x + 1</span>
                </a>
              </li>
              <ul>
                <li>
                  <a href="/0/-/0/result" target="resultPane">
                    <code>x</code>
                    <span>3</span>
                  </a>
                </li>
              </ul>
            </ul>
          </ul>
        </ul>
      `
    );
    const decomposition = resultDecomposition(trace);
    assert.deepEqual(decomposition, {
      result: 8,
      0: {
        result: 4,
        "-": {
          result: 4,
          0: {
            result: 3,
          },
        },
      },
    });
  });

  test("trace template", async () => {
    const context = new (HandleExtensionsTransform(ObjectTree))({
      "greet.ori": "(name) => `Hello, ${ name }!`",
    });
    context.parent = builtinsTree;
    const source = `greet.ori("Origami")`;
    const program = compile.expression(source);
    const result = await program.call(context);
    assert.strictEqual(result, "Hello, Origami!");
    const trace = lastTrace(result);
    const html = await traceHtml(trace, "/");
    assert.deepStrictEqual(
      html,
      indent`
        <ul>
          <li>
            <a href="/result" target="resultPane">
              <code>greet.ori(&quot;Origami&quot;)</code>
              <span>Hello, Origami!</span>
            </a>
          </li>
          <ul>
            <div>⋮</div>
            <li>
              <a href="/-/result" target="resultPane">
                <code>greet.ori</code>
                <span>(name) =&gt; \`Hello, \${ name }!\`</span>
              </a>
            </li>
            <ul>
              <li>
                <a href="/-/0/result" target="resultPane">
                  <code>name</code>
                  <span>Origami</span>
                </a>
              </li>
            </ul>
          </ul>
        </ul>
      `
    );
    const decomposition = resultDecomposition(trace);
    assert.deepEqual(await toPlainValue(decomposition), {
      result: "Hello, Origami!",
      0: {
        result: "(name) => `Hello, ${ name }!`",
      },
      "-": {
        result: "Hello, Origami!",
        0: {
          result: "Origami",
        },
      },
    });
  });
});
