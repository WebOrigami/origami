import { ObjectTree, toPlainValue } from "@weborigami/async-tree";
import {
  HandleExtensionsTransform,
  taggedTemplateIndent as indent,
} from "@weborigami/language";
import * as compile from "@weborigami/language/src/compiler/compile.js";
import assert from "node:assert";
import { describe, test } from "node:test";
import { builtinsTree } from "../../src/internal.js";
import { resultDecomposition, resultTrace } from "../../src/server/trace.js";

describe("trace", () => {
  test.only("trace function call", async () => {
    const source = indent`{
      f: (x) => x + 1
      g: 2 * f/(3)
    }`;
    const program = compile.expression(source);
    const object = await program.call(null);
    const result = await object.g;
    assert.strictEqual(result.valueOf(), 8);
    const html = await resultTrace(result, "/test");
    assert.deepEqual(
      html,
      indent`
        <ul>
          <li><em>2 * f/(3)</em> 8</li>
          <ul>
            <li><em>f/(3)</em> 4</li>
            <ul>
              <li><em>f</em> x + 1</li>
              <ul>
                <li><em>x</em> 3</li>
              </ul>
            </ul>
          </ul>
        </ul>
      `
    );
    const decomposition = resultDecomposition(result);
    assert.deepEqual(await toPlainValue(decomposition), {
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

  test.only("trace template", async () => {
    const context = new (HandleExtensionsTransform(ObjectTree))({
      "greet.ori": "(name) => `Hello, ${ name }!`",
    });
    context.parent = builtinsTree;
    const source = `greet.ori("Origami")`;
    const program = compile.expression(source);
    const result = await program.call(context);
    assert.strictEqual(String(result), "Hello, Origami!");
    const html = await resultTrace(result, "/");
    assert.deepStrictEqual(
      html,
      // indent`
      //   <ul>
      //     <li><a href="/result"><em>greet.ori("Origami")</em> Hello, Origami!</a></li>
      //     <ul>
      //       <li><a href="/0/result"><em>greet.ori</em> \`Hello, \${ name }!\`</a></li>
      //       <ul>
      //         <li><a href="/-/0/result"><em>name</em> Origami</a></li>
      //       </ul>
      //     </ul>
      //   </ul>
      // `
      indent`
        <ul>
          <li><em>greet.ori("Origami")</em> Hello, Origami!</li>
          <ul>
            <li><em>greet.ori</em> (name) => \`Hello, \${ name }!\`</li>
            <ul>
              <li><em>name</em> Origami</li>
            </ul>
          </ul>
        </ul>
      `
    );
    const decomposition = resultDecomposition(result);
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
