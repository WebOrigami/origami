import { ObjectTree } from "@weborigami/async-tree";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import optimize from "../../src/compiler/optimize.js";
import { markers } from "../../src/compiler/parserHelpers.js";
import { ops } from "../../src/runtime/internal.js";
import { assertCodeEqual, createCode } from "./codeHelpers.js";

describe.only("optimize", () => {
  test("change local references to context references", () => {
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
    assertCompile(expression, expected);
    assertCompile(expression, expected, "jse");
  });

  test("when defining a property, avoid recursive references", () => {
    const expression = `{
      name: "Alice",
      user: {
        name: name
      }
    }`;
    const expected = [
      ops.object,
      ["name", "Alice"],
      ["user", [ops.object, ["name", [[ops.context, 1], "name"]]]],
    ];
    assertCompile(expression, expected);
    assertCompile(expression, expected, "jse");
  });

  test("cache shell non-local references to globals+scope calls", () => {
    // Compilation of `x/y/z.js`
    const code = createCode([
      markers.reference,
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

  test("change jse non-local references to globals", () => {
    // Compilation of `x/y`
    const code = createCode([
      markers.reference,
      [ops.literal, "x/"],
      [ops.literal, "y"],
    ]);
    const globals = {};
    const expected = [globals, "x/", "y"];
    assertCodeEqual(optimize(code, { globals, mode: "jse" }), expected);
  });

  test("cache jse top-level scope references", () => {
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

  test("cache jse deeper scope references", () => {
    // Compilation of `{ property: <x> }`
    const code = createCode([
      ops.object,
      ["property", [[ops.scope], [ops.literal, "x"]]],
    ]);
    const expected = [
      ops.object,
      ["property", [ops.cache, {}, "x", [[ops.scope, [ops.context, 1]], "x"]]],
    ];
    assertCodeEqual(optimize(code, { mode: "jse" }), expected);
  });

  describe.only("transform ambiguous path", () => {
    test("path head is global", () => {
      // Math.PI/Math.E
      const code = createCode([
        markers.path,
        [
          [ops.literal, "Math"],
          [ops.literal, "PI"],
        ],
        [
          [ops.literal, "Math"],
          [ops.literal, "E"],
        ],
      ]);
      const globals = { Math: { PI: 0, E: 0 } }; // values don't matter
      const actual = optimize(code, { globals });
      assertCodeEqual(actual, [
        ops.division,
        [[globals, "Math"], "PI"],
        [[globals, "Math"], "E"],
      ]);
    });

    test("path head is local", () => {
      // x.y, where x is local
      const code = createCode([
        markers.path,
        [
          [ops.literal, "x"],
          [ops.literal, "y"],
        ],
      ]);
      const locals = [["x"]];
      const actual = optimize(code, { locals });
      assertCodeEqual(actual, [[ops.context, 0], "y"]);
    });

    test("path head is external", () => {
      // a.b/x.y where a is neither local nor global
      const code = createCode([
        markers.path,
        [
          [ops.literal, "a"],
          [ops.literal, "b"],
        ],
        [
          [ops.literal, "x"],
          [ops.literal, "y"],
        ],
      ]);
      const globals = {};
      const actual = optimize(code, { globals });
      assertCodeEqual(actual, [
        ops.cache,
        {},
        "a.b/x.y",
        [[ops.scope, "a.b/"], "x.y"],
      ]);
    });
  });
});

function assertCompile(expression, expected, mode = "shell") {
  const parent = new ObjectTree({});
  const globals = new ObjectTree({});
  const fn = compile.expression(expression, { globals, mode, parent });
  const actual = fn.code;
  assertCodeEqual(actual, expected);
}
