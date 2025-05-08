import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import optimize from "../../src/compiler/optimize.js";
import { ops } from "../../src/runtime/internal.js";
import { assertCodeEqual, createCode } from "./codeHelpers.js";

describe("optimize", () => {
  test("optimize non-local ops.scope calls to ops.external", async () => {
    const expression = `
      (name) => {
        a: 1
        b: a            // local, should be left as ops.scope
        c: elsewhere    // external, should be converted to ops.external
        d: name         // local, should be left as ops.scope
      }
    `;
    const parent = new ObjectTree({});
    const fn = compile.expression(expression, { parent });
    const code = fn.code;

    // Extract the parent scope from the code and check it
    const parentScope = code[2][3][1][2][0];
    assert.deepEqual(parentScope.trees, [parent]);

    assertCodeEqual(code, [
      ops.lambda,
      [[ops.literal, "name"]],
      [
        ops.object,
        ["a", 1],
        ["b", [ops.scope, "a"]],
        ["c", [ops.external, "elsewhere", [parentScope, "elsewhere"], {}]],
        ["d", [ops.scope, "name"]],
      ],
    ]);
  });

  test("optimize scope traversals with all literal keys", async () => {
    // Compilation of `x/y.js`
    const code = createCode([
      ops.traverse,
      [ops.scope, "x/"],
      [ops.literal, "y.js"],
    ]);
    const optimized = optimize(code);
    assertCodeEqual(optimized, [ops.external, "x/y.js", code, {}]);
  });
});
