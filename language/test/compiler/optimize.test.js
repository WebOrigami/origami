import { ObjectTree } from "@weborigami/async-tree";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import optimize from "../../src/compiler/optimize.js";
import { reference } from "../../src/compiler/parserHelpers.js";
import { ops } from "../../src/runtime/internal.js";
import { assertCodeEqual, createCode } from "./codeHelpers.js";

describe("optimize", () => {
  test("change local references to context references", async () => {
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

  test("cache shell non-local references to globals+scope calls", async () => {
    // Compilation of `x/y/z.js`
    const code = createCode([
      reference,
      [ops.literal, "x/"],
      [ops.literal, "y/"],
      [ops.literal, "z.js"],
    ]);
    const globals = {};
    const expected = [
      ops.cache,
      {},
      "x/y/z.js",
      [[ops.merge, globals, [ops.scope]], "x/", "y/", "z.js"],
    ];
    assertCodeEqual(optimize(code, { globals }), expected);
  });

  test("change jse non-local references to globals", async () => {
    // Compilation of `x/y`
    const code = createCode([
      reference,
      [ops.literal, "x/"],
      [ops.literal, "y"],
    ]);
    const globals = {};
    const expected = [globals, "x/", "y"];
    assertCodeEqual(optimize(code, { globals, mode: "jse" }), expected);
  });

  test("cache jse scope references", async () => {
    // Compilation of `x/y/z.js`
    const code = createCode([
      [ops.scope],
      [ops.literal, "x/"],
      [ops.literal, "y/"],
      [ops.literal, "z.js"],
    ]);
    const expected = [
      ops.cache,
      {},
      "x/y/z.js",
      [[ops.scope], "x/", "y/", "z.js"],
    ];
    assertCodeEqual(optimize(code, { mode: "jse" }), expected);
  });
});

async function assertCompile(expression, expected, mode = "shell") {
  const parent = new ObjectTree({});
  const globals = new ObjectTree({});
  const fn = compile.expression(expression, { globals, mode, parent });
  const actual = fn.code;
  assertCodeEqual(actual, expected);
}
