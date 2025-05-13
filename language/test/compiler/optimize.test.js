import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import optimize from "../../src/compiler/optimize.js";
import { ops } from "../../src/runtime/internal.js";
import { assertCodeEqual, createCode } from "./codeHelpers.js";

describe("optimize", () => {
  test("optimize non-local ops.scope calls in shell mode", async () => {
    const expression = `
      (name) => {
        a: 1
        b: a            // local key, should be optimized to ops.local
        c: elsewhere    // external, should be optimized to ops.external
        d: name         // local parameter, should be optimized to ops.local
      }
    `;
    const parent = new ObjectTree({});
    const globals = new ObjectTree({});
    const fn = compile.expression(expression, { globals, parent });
    const code = fn.code;

    // Extract the external scope from the code
    const externalScope = code[2][3][1][2][0];
    // Confirm it contains the globals
    assert.equal(externalScope.trees[0], globals);
    // Confirm it contains the parent scope
    assert.equal(externalScope.trees[1].trees[0], parent);

    assertCodeEqual(code, [
      ops.lambda,
      [[ops.literal, "name"]],
      [
        ops.object,
        ["a", 1],
        ["b", [ops.local, 0, "a"]],
        ["c", [ops.external, "elsewhere", [externalScope, "elsewhere"], {}]],
        ["d", [ops.local, 1, "name"]],
      ],
    ]);
  });

  test("optimize non-local ops.scope calls in jse mode", async () => {
    const expression = `
      (name) => {
        a: 1,
        b: a,           // local key, should be optimized to ops.local
        c: elsewhere,   // external, should reference globals
        d: name,        // local parameter, should be optimized to ops.local
        e: <path>       // path, should reference parent scope
      }
    `;
    const parent = new ObjectTree({});
    const globals = new ObjectTree({});
    const fn = compile.expression(expression, { globals, mode: "jse", parent });
    const code = fn.code;

    // Extract the globals from the code and check it
    const globalsReference = code[2][3][1][0];
    assert.deepEqual(globalsReference, globals);

    // Extract the parent scope from the code and check it
    const parentScope = code[2][5][1][2][0];
    assert.deepEqual(parentScope.trees, [parent]);

    assertCodeEqual(code, [
      ops.lambda,
      [[ops.literal, "name"]],
      [
        ops.object,
        ["a", 1],
        ["b", [ops.local, 0, "a"]],
        ["c", [globalsReference, "elsewhere"]],
        ["d", [ops.local, 1, "name"]],
        ["e", [ops.external, "path", [parentScope, "path"], {}]],
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
