import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import optimize from "../../src/compiler/optimize.js";
import { ops } from "../../src/runtime/internal.js";
import { assertCodeEqual, createCode } from "./codeHelpers.js";

describe("optimize", () => {
  test("optimize local ops.scope calls to local references", async () => {
    const expression = `(name) => {
      a: name,
      b: a
    }`;
    const expected = [
      ops.lambda,
      [[ops.literal, "name"]],
      [
        ops.object,
        ["a", [[ops.context, 1], "name"]],
        ["b", [[ops.context], "a"]],
      ],
    ];
    await assertCompile(expression, expected);
    await assertCompile(expression, expected, "jse");
  });

  test("optimize path references to ops.external", async () => {
    const expression = `<folder/file.txt>`;
    const expected = [
      [ops.scope],
      [ops.literal, "folder/"],
      [ops.literal, "file.txt"],
    ];
    await assertCompile(expression, expected, "jse");
  });

  test.skip("optimize non-local ops.scope calls in shell mode", async () => {
    const expression = `
      (name) => {
        a: 1
        b: a            // local key, optimizes to local ref in same object
        c: elsewhere    // external, optimizes to ops.external
        d: name         // local parameter, optimizes to local ref in parent
      }
    `;
    const parent = new ObjectTree({});
    const globals = new ObjectTree({});
    const fn = compile.expression(expression, { globals, parent });
    const code = fn.code;

    assertCodeEqual(code, [
      ops.lambda,
      [[ops.literal, "name"]],
      [
        ops.object,
        ["a", 1],
        ["b", [[ops.context], "a"]],
        ["c", [ops.external, {}, 0, "elsewhere"]],
        ["d", [[ops.context, 1], "name"]],
      ],
    ]);
  });

  test.skip("optimize non-local ops.scope calls in jse mode", async () => {
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
    // Compilation of `x/y/z.js`
    const code = createCode([
      [ops.scope, "x/"],
      [ops.literal, "y/"],
      [ops.literal, "z.js"],
    ]);
    const optimized = optimize(code);
    assertCodeEqual(optimized, [ops.cache, "x/y.js", code, {}]);
  });
});

async function assertCompile(expression, expected, mode = "shell") {
  const parent = new ObjectTree({});
  const globals = new ObjectTree({});
  const fn = compile.expression(expression, { globals, mode, parent });
  const actual = fn.code;
  assertCodeEqual(actual, expected);
}
