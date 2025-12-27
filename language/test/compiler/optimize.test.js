import { SyncMap } from "@weborigami/async-tree";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import {
  REFERENCE_INHERITED,
  REFERENCE_PARAM,
  default as optimize,
} from "../../src/compiler/optimize.js";
import { markers } from "../../src/compiler/parserHelpers.js";
import { ops } from "../../src/runtime/internal.js";
import {
  assertCodeEqual,
  assertCodeLocations,
  createCode,
} from "./codeHelpers.js";

describe("optimize", () => {
  test("change local references to context references", () => {
    const expression = `(name) => {
      a: name,
      b: a
    }`;
    const expected = [
      ops.lambda,
      1,
      [["name", [[ops.params, 0], 0]]],
      [
        ops.object,
        [
          "a",
          [
            [ops.params, 0],
            [ops.literal, "name"],
          ],
        ],
        [
          "b",
          [
            [ops.inherited, 0],
            [ops.literal, "a"],
          ],
        ],
      ],
    ];
    assertCompile(expression, expected);
  });

  test("resolve deeper context references", () => {
    // Compilation of `{ a: 1, more: { a } }`
    const code = createCode([
      ops.object,
      ["a", [ops.literal, 1]],
      [
        "more",
        [ops.object, ["a", [markers.traverse, [markers.reference, "a"]]]],
      ],
    ]);
    const expected = [
      ops.object,
      ["a", 1],
      [
        "more",
        [
          ops.object,
          [
            "a",
            [
              [ops.inherited, 1],
              [ops.literal, "a"],
            ],
          ],
        ],
      ],
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
      [
        "user",
        [
          ops.object,
          [
            "name",
            [
              [ops.inherited, 1],
              [ops.literal, "name"],
            ],
          ],
        ],
      ],
    ];
    assertCompile(expression, expected);
    assertCompile(expression, expected, "shell");
  });

  describe("resolve reference", () => {
    test("external reference", () => {
      // Compilation of `folder` where folder isn't a variable
      const code = createCode([
        markers.traverse,
        [markers.reference, "folder"],
      ]);
      const parent = {};
      const expected = [
        ops.cache,
        {},
        "folder",
        [
          [ops.scope, parent],
          [ops.literal, "folder"],
        ],
      ];
      const globals = {};
      assertCodeEqual(optimize(code, { globals, parent }), expected);
    });

    test("external reference", () => {
      // Compilation of `index.html` where `index` isn't a variable
      const code = createCode([
        markers.traverse,
        [markers.reference, "index.html"],
      ]);
      const parent = {};
      const expected = [
        ops.cache,
        {},
        "index.html",
        [
          [ops.scope, parent],
          [ops.literal, "index.html"],
        ],
      ];
      const globals = {};
      assertCodeEqual(optimize(code, { globals, parent }), expected);
    });

    test("external reference inside object with matching key", () => {
      // Compilation of `{ (posts) = posts.txt }`
      const code = createCode([
        ops.object,
        [
          "(posts)",
          [ops.getter, [markers.traverse, [markers.reference, "posts.txt"]]],
        ],
      ]);
      const parent = {};
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
              [
                [ops.scope, parent],
                [ops.literal, "posts.txt"],
              ],
            ],
          ],
        ],
      ];
      const globals = {};
      assertCodeEqual(optimize(code, { globals, parent }), expected);
    });

    test("global reference", () => {
      // Compilation of `Math` where Math is a global variable
      const code = createCode([markers.traverse, [markers.reference, "Math"]]);
      const globals = { Math: {} }; // value doesn't matter
      const expected = globals.Math;
      assertCodeEqual(optimize(code, { globals }), expected);
    });

    test("global reference", () => {
      // Compilation of `Math.PI` where Math is a global variable
      const code = createCode([
        markers.traverse,
        [markers.reference, "Math.PI"],
      ]);
      const globals = { Math: { PI: null } }; // value doesn't matter
      const expected = [ops.property, globals.Math, "PI"];
      assertCodeEqual(optimize(code, { globals }), expected);
    });

    test("local reference", () => {
      // Compilation of `post` where post is a local parameter
      const code = createCode([markers.traverse, [markers.reference, "post"]]);
      const globals = { post: {} }; // local should take precedence
      const locals = [{ type: REFERENCE_PARAM, names: ["post"] }];
      const actual = optimize(code, { globals, locals });
      const expected = [
        [ops.params, 0],
        [ops.literal, "post"],
      ];
      assertCodeEqual(actual, expected);
    });

    test("local reference and property", () => {
      // Compilation of `post.author.name` where `post` is a local inherited property
      const code = createCode([
        markers.traverse,
        [markers.reference, "post.author.name"],
      ]);
      const globals = { post: {} }; // local should take precedence
      const locals = [{ type: REFERENCE_INHERITED, names: ["post"] }];
      const actual = optimize(code, { globals, locals });
      const expected = [
        ops.property,
        [
          ops.property,
          [
            [ops.inherited, 0],
            [ops.literal, "post"],
          ],
          "author",
        ],
        "name",
      ];
      assertCodeEqual(actual, expected);
    });

    test("root directory", () => {
      // Compilation of `</>`
      const code = createCode([markers.traverse, [markers.external, "/"]]);
      const expected = [ops.cache, {}, "/", [ops.rootDirectory]];
      assertCodeEqual(optimize(code), expected);
    });

    test("home directory", () => {
      // Compilation of `<~>`
      const code = createCode([markers.traverse, [ops.homeDirectory]]);
      const expected = [ops.cache, {}, "~", [ops.homeDirectory]];
      assertCodeEqual(optimize(code), expected);
    });
  });

  describe("path traversal", () => {
    test("explicit external path", () => {
      // `<path/to/file>`
      const code = createCode([
        markers.traverse,
        [markers.external, "path/"],
        [ops.literal, "to/"],
        [ops.literal, "file"],
      ]);
      const parent = {};
      const expected = [
        ops.cache,
        {},
        "path/to/file",
        [
          [ops.scope, parent],
          [ops.literal, "path/"],
          [ops.literal, "to/"],
          [ops.literal, "file"],
        ],
      ];
      assertCodeEqual(optimize(code, { parent }), expected);
    });

    test("implicit external path", () => {
      // Compilation of `package.json/name` where package is neither local nor global
      const code = createCode([
        markers.traverse,
        [markers.reference, "package.json/"],
        [ops.literal, "name"],
      ]);
      const globals = {};
      const parent = {};
      const expected = [
        ops.cache,
        {},
        "package.json/name",
        [
          [ops.scope, parent],
          [ops.literal, "package.json/"],
          [ops.literal, "name"],
        ],
      ];
      assertCodeEqual(optimize(code, { globals, parent }), expected);
    });

    test("local path", () => {
      // Compilation of `page/title` where page is a local parameter
      const code = createCode([
        markers.traverse,
        [markers.reference, "page/"],
        [ops.literal, "title"],
      ]);
      const globals = {};
      const locals = [{ type: REFERENCE_PARAM, names: ["page"] }];
      const actual = optimize(code, { globals, locals });
      const expected = [
        [ops.params, 0],
        [ops.literal, "page/"],
        [ops.literal, "title"],
      ];
      assertCodeEqual(actual, expected);
    });
  });
});

function assertCompile(expression, expected, mode = "shell") {
  const parent = new SyncMap();
  const globals = {};
  const fn = compile.expression(expression, { globals, mode, parent });
  const actual = fn.code;
  assertCodeLocations(actual);
  assertCodeEqual(actual, expected);
}
