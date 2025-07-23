import { ObjectTree } from "@weborigami/async-tree";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import optimize from "../../src/compiler/optimize.js";
import { markers } from "../../src/compiler/parserHelpers.js";
import { ops } from "../../src/runtime/internal.js";
import { assertCodeEqual, createCode } from "./codeHelpers.js";

describe("optimize", () => {
  test.only("change local references to context references", () => {
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
  });

  test("resolve deeper context references", () => {
    // Compilation of `{ a: 1, more: { a } }`
    const code = createCode([
      ops.object,
      ["a", [ops.literal, 1]],
      ["more", [ops.object, ["a", [markers.reference, "a"]]]],
    ]);
    const expected = [
      ops.object,
      ["a", 1],
      ["more", [ops.object, ["a", [[ops.context, 1], "a"]]]],
    ];
    assertCodeEqual(optimize(code), expected);
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

  describe("resolve reference to simple key", () => {
    test("external reference", () => {
      // Compilation of `folder` where folder isn't a variable
      const code = createCode([markers.reference, "folder"]);
      const expected = [ops.cache, {}, "folder", [[ops.scope], "folder"]];
      const globals = {};
      assertCodeEqual(optimize(code, { globals }), expected);
    });

    test("external reference inside object with matching key", () => {
      // Compilation of `{ (posts) = posts.txt }`
      const code = createCode([
        ops.object,
        ["(posts)", [ops.getter, [markers.reference, "posts.txt"]]],
      ]);
      const expected = [
        ops.object,
        [
          "(posts)",
          [
            ops.getter,
            [
              ops.cache,
              {},
              "posts.txt",
              [[ops.scope, [ops.context, 1]], "posts.txt"],
            ],
          ],
        ],
      ];
      const globals = {};
      assertCodeEqual(optimize(code, { globals }), expected);
    });

    test("global reference", () => {
      // Compilation of `Math` where Math is a global variable
      const code = createCode([markers.reference, "Math"]);
      const globals = { Math: { PI: 0 } }; // value doesn't matter
      const expected = [globals, "Math"];
      assertCodeEqual(optimize(code, { globals }), expected);
    });

    test("local reference", () => {
      // Compilation of `post` where post is a local variable
      const code = createCode([markers.reference, "post"]);
      const globals = { post: {} }; // local should take precedence
      const locals = [["post"]];
      const actual = optimize(code, { globals, locals });
      const expected = [[ops.context], "post"];
      assertCodeEqual(actual, expected);
    });
  });

  describe("resolve dot chain", () => {
    test("external reference", () => {
      // Compilation of `index.html` where `index` isn't a variable
      const code = createCode([
        markers.dots,
        [ops.literal, "index"],
        [ops.literal, "html"],
      ]);
      const expected = [
        ops.cache,
        {},
        "index.html",
        [[ops.scope], "index.html"],
      ];
      const globals = {};
      assertCodeEqual(optimize(code, { globals }), expected);
    });

    test("global reference", () => {
      // Compilation of `Math.PI` where Math is a global variable
      const code = createCode([
        markers.dots,
        [ops.literal, "Math"],
        [ops.literal, "PI"],
      ]);
      const globals = { Math: { PI: 0 } }; // value doesn't matter
      const expected = [[globals, "Math"], "PI"];
      assertCodeEqual(optimize(code, { globals }), expected);
    });

    test("local reference", () => {
      // Compilation of `post.title` where post is a local variable
      const code = createCode([
        markers.dots,
        [ops.literal, "post"],
        [ops.literal, "title"],
      ]);
      const globals = {};
      const locals = [["post"]];
      const actual = optimize(code, { globals, locals });
      const expected = [[[ops.context], "post"], "title"];
      assertCodeEqual(actual, expected);
    });

    test("ambiguous local x.y reference", () => {
      const expression = `{
        index: "a"
        index.html: "b"
        result: index.html
      }`;
      const expected = [
        ops.object,
        ["index", "a"],
        ["index.html", "b"],
        ["result", [[ops.context], "index.html"]],
      ];
      assertCompile(expression, expected);
    });
  });

  describe("resolve path", () => {
    test("external path", () => {
      // Compilation of `package.json/name` where package is neither local nor global
      const code = createCode([
        markers.path,
        [markers.dots, [ops.literal, "package"], [ops.literal, "json"]],
        [ops.literal, "name"],
      ]);
      const globals = {};
      const expected = [
        ops.cache,
        {},
        "package.json/name",
        [[ops.scope], "package.json/", "name"],
      ];
      assertCodeEqual(optimize(code, { globals }), expected);
    });

    test("global division", () => {
      // Compilation of `Math.PI/Math.E` where Math is a global variable
      const code = createCode([
        markers.path,
        [markers.dots, [ops.literal, "Math"], [ops.literal, "PI"]],
        [markers.dots, [ops.literal, "Math"], [ops.literal, "E"]],
      ]);
      const globals = { Math: {} }; // values don't matter
      const locals = [["x"]];
      const expected = [
        ops.division,
        [[globals, "Math"], "PI"],
        [[globals, "Math"], "E"],
      ];
      assertCodeEqual(
        optimize(code, { globals, locals, mode: "jse" }),
        expected
      );
    });

    test("local division", () => {
      // Compilation of `post.count/x` where post and x are local variables
      const code = createCode([
        markers.path,
        [markers.dots, [ops.literal, "post"], [ops.literal, "count"]],
        [ops.literal, "x"],
      ]);
      const globals = {};
      const locals = [["post", "x"]];
      const actual = optimize(code, { globals, locals, mode: "jse" });
      const expected = [
        ops.division,
        [[[ops.context], "post"], "count"],
        [[ops.context], "x"],
      ];
      assertCodeEqual(actual, expected);
    });

    // TODO: Remove
    test("local path [deprecated]", () => {
      // Compilation of `page/title` where page is a local variable
      const code = createCode([
        markers.path,
        [ops.literal, "page"],
        [ops.literal, "title"],
      ]);
      const globals = {};
      const locals = [["page"]];
      const actual = optimize(code, { globals, locals });
      const expected = [[[ops.context], "page"], "title"];
      assertCodeEqual(actual, expected);
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
