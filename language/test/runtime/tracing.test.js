import { toPlainValue } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import indent from "../../src/runtime/taggedTemplateIndent.js";
import { lastTrace } from "../../src/runtime/tracing.js";

describe("tracing", () => {
  test("evaluating code records last result and trace", async () => {
    const source = indent`{
      f: (x) => x + 1
      g: 2 * f/(3)
    }`;
    const program = compile.expression(source);
    const object = await program.call(null);
    const result = await object.g;
    assert.strictEqual(result.valueOf(), 8);
    const trace = toPlainValue(lastTrace());
    // assert.deepEqual(trace, {});
  });
});
