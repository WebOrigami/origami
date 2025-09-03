import assert from "node:assert";
import { describe, test } from "node:test";
import { parse } from "../../src/compiler/parse.js";
import { markers } from "../../src/compiler/parserHelpers.js";
import * as ops from "../../src/runtime/ops.js";
import { assertCodeEqual, assertCodeLocations } from "./codeHelpers.js";

describe("Origami parser", () => {
  test("additiveExpression", () => {
    assertParse("additiveExpression", "1 + 2", [
      ops.addition,
      [ops.literal, 1],
      [ops.literal, 2],
    ]);
    assertParse("additiveExpression", "5 - 4", [
      ops.subtraction,
      [ops.literal, 5],
      [ops.literal, 4],
    ]);
  });

  describe("angleBracketLiteral", () => {
    test("with path", () => {
      assertParse("angleBracketLiteral", "<index.html>", [
        markers.traverse,
        [markers.external, "index.html"],
      ]);
      assertParse(
        "angleBracketLiteral",
        "<Path with spaces (and parens).html>",
        [
          markers.traverse,
          [markers.external, "Path with spaces (and parens).html"],
        ]
      );
      assertParse("angleBracketLiteral", "<foo/bar/baz>", [
        markers.traverse,
        [markers.external, "foo/"],
        [ops.literal, "bar/"],
        [ops.literal, "baz"],
      ]);
    });

    test("root directory", () => {
      assertParse("angleBracketLiteral", "</>", [
        markers.traverse,
        [markers.external, "/"],
      ]);
      assertParse("angleBracketLiteral", "</etc/passwd>", [
        markers.traverse,
        [markers.external, "/"],
        [ops.literal, "etc/"],
        [ops.literal, "passwd"],
      ]);
    });

    test("home directory", () => {
      assertParse("angleBracketLiteral", "<~>", [
        markers.traverse,
        [markers.external, "~"],
      ]);
      assertParse("angleBracketLiteral", "<~/.bash_profile>", [
        markers.traverse,
        [markers.external, "~/"],
        [ops.literal, ".bash_profile"],
      ]);
    });

    test("with protocol URL", () => {
      assertParse("angleBracketLiteral", "<files:src/assets>", [
        [markers.global, "files:"],
        [ops.literal, "src/"],
        [ops.literal, "assets"],
      ]);
      assertParse("angleBracketLiteral", "<https://example.com/data.yaml>", [
        [markers.global, "https:"],
        [ops.literal, "example.com/"],
        [ops.literal, "data.yaml"],
      ]);
    });
  });

  test("arrayLiteral", () => {
    assertParse("arrayLiteral", "[]", [ops.array]);
    assertParse("arrayLiteral", "[1, 2, 3]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, 2],
      [ops.literal, 3],
    ]);
    assertParse("arrayLiteral", "[ 1 , 2 , 3 ]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, 2],
      [ops.literal, 3],
    ]);
    assertParse("arrayLiteral", "[1,,,4]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, undefined],
      [ops.literal, undefined],
      [ops.literal, 4],
    ]);
    assertParse("arrayLiteral", "[ 1, ...[2, 3]]", [
      ops.flat,
      [ops.array, [ops.literal, 1]],
      [ops.array, [ops.literal, 2], [ops.literal, 3]],
    ]);
    assertParse(
      "arrayLiteral",
      `[
        1
        2
        3
      ]`,
      [ops.array, [ops.literal, 1], [ops.literal, 2], [ops.literal, 3]]
    );
  });

  test("arrowFunction", () => {
    assertParse("arrowFunction", "() => foo", [
      ops.lambda,
      [],
      [markers.traverse, [markers.reference, "foo"]],
    ]);
    assertParse("arrowFunction", "x => y", [
      ops.lambda,
      [[ops.literal, "x"]],
      [markers.traverse, [markers.reference, "y"]],
    ]);
    assertParse("arrowFunction", "(a, b, c) ⇒ fn(a, b, c)", [
      ops.lambda,
      [
        [ops.literal, "a"],
        [ops.literal, "b"],
        [ops.literal, "c"],
      ],
      [
        [markers.traverse, [markers.reference, "fn"]],
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
        [markers.traverse, [markers.reference, "c"]],
      ],
    ]);
    assertParse("arrowFunction", "a => b => fn(a, b)", [
      ops.lambda,
      [[ops.literal, "a"]],
      [
        ops.lambda,
        [[ops.literal, "b"]],
        [
          [markers.traverse, [markers.reference, "fn"]],
          [markers.traverse, [markers.reference, "a"]],
          [markers.traverse, [markers.reference, "b"]],
        ],
      ],
    ]);
    assertParse("arrowFunction", "async (x) => x", [
      ops.lambda,
      [[ops.literal, "x"]],
      [markers.traverse, [markers.reference, "x"]],
    ]);
  });

  test("bitwiseAndExpression", () => {
    assertParse("bitwiseAndExpression", "5 & 3", [
      ops.bitwiseAnd,
      [ops.literal, 5],
      [ops.literal, 3],
    ]);
  });

  test("bitwiseOrExpression", () => {
    assertParse("bitwiseOrExpression", "5 | 3", [
      ops.bitwiseOr,
      [ops.literal, 5],
      [ops.literal, 3],
    ]);
  });

  test("bitwiseXorExpression", () => {
    assertParse("bitwiseXorExpression", "5 ^ 3", [
      ops.bitwiseXor,
      [ops.literal, 5],
      [ops.literal, 3],
    ]);
  });

  describe("callExpression", () => {
    test("with parentheses arguments", () => {
      assertParse("callExpression", "fn()", [
        [markers.traverse, [markers.reference, "fn"]],
        undefined,
      ]);
      assertParse("callExpression", "foo.js(arg)", [
        [markers.traverse, [markers.reference, "foo.js"]],
        [markers.traverse, [markers.reference, "arg"]],
      ]);
      assertParse("callExpression", "fn(a, b)", [
        [markers.traverse, [markers.reference, "fn"]],
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
      ]);
      assertParse("callExpression", "foo.js( a , b )", [
        [markers.traverse, [markers.reference, "foo.js"]],
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
      ]);
      assertParse("callExpression", "fn()(arg)", [
        [[markers.traverse, [markers.reference, "fn"]], undefined],
        [markers.traverse, [markers.reference, "arg"]],
      ]);
    });

    test("call chains", () => {
      assertParse("callExpression", "(foo.js())('arg')", [
        [[markers.traverse, [markers.reference, "foo.js"]], undefined],
        [ops.literal, "arg"],
      ]);
      assertParse("callExpression", "fn('a')('b')", [
        [
          [markers.traverse, [markers.reference, "fn"]],
          [ops.literal, "a"],
        ],
        [ops.literal, "b"],
      ]);
      assertParse("callExpression", "(foo.js())(a, b)", [
        [[markers.traverse, [markers.reference, "foo.js"]], undefined],
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
      ]);
    });

    test("with paths", () => {
      assertParse("callExpression", "tree/", [
        ops.unpack,
        [markers.traverse, [markers.reference, "tree/"]],
      ]);
      assertParse("callExpression", "tree/foo/bar", [
        markers.traverse,
        [markers.reference, "tree/"],
        [ops.literal, "foo/"],
        [ops.literal, "bar"],
      ]);
      assertParse("callExpression", "tree/foo/bar/", [
        ops.unpack,
        [
          markers.traverse,
          [markers.reference, "tree/"],
          [ops.literal, "foo/"],
          [ops.literal, "bar/"],
        ],
      ]);
      // Consecutive slahes in a path are removed
      assertParse("callExpression", "tree//key", [
        markers.traverse,
        [markers.reference, "tree/"],
        [ops.literal, "key"],
      ]);
      assertParse("callExpression", "{ a: 1, b: 2}/b", [
        [ops.object, ["a", [ops.literal, 1]], ["b", [ops.literal, 2]]],
        [ops.literal, "b"],
      ]);
      assertParse("callExpression", "files:foo/bar", [
        [markers.global, "files:"],
        [ops.literal, "foo/"],
        [ops.literal, "bar"],
      ]);
    });

    test("path and parentheses chains", () => {
      assertParse("callExpression", "foo.js()/key", [
        [[markers.traverse, [markers.reference, "foo.js"]], undefined],
        [ops.literal, "key"],
      ]);
      assertParse("callExpression", "tree/key()", [
        [markers.traverse, [markers.reference, "tree/"], [ops.literal, "key"]],
        undefined,
      ]);
      assertParse("callExpression", "fn()/key()", [
        [
          [[markers.traverse, [markers.reference, "fn"]], undefined],
          [ops.literal, "key"],
        ],
        undefined,
      ]);
      assertParse("callExpression", "package:@weborigami/dropbox/auth(creds)", [
        [
          [markers.global, "package:"],
          [ops.literal, "@weborigami/"],
          [ops.literal, "dropbox/"],
          [ops.literal, "auth"],
        ],
        [markers.traverse, [markers.reference, "creds"]],
      ]);
    });

    test("tagged templates", () => {
      assertParse("callExpression", "indent`hello`", [
        [markers.traverse, [markers.reference, "indent"]],
        [ops.literal, ["hello"]],
      ]);
      assertParse("callExpression", "fn.js`Hello, world.`", [
        [markers.traverse, [markers.reference, "fn.js"]],
        [ops.literal, ["Hello, world."]],
      ]);
    });

    test("protocols", () => {
      assertParse("callExpression", "files:src/assets", [
        [markers.global, "files:"],
        [ops.literal, "src/"],
        [ops.literal, "assets"],
      ]);
      assertParse("callExpression", "<node:process>.env", [
        ops.property,
        [
          [markers.global, "node:"],
          [ops.literal, "process"],
        ],
        [ops.literal, "env"],
      ]);
    });
  });

  test("commaExpression", () => {
    assertParse("commaExpression", "1", [ops.literal, 1]);
    assertParse("commaExpression", "a, b, c", [
      ops.comma,
      [markers.traverse, [markers.reference, "a"]],
      [markers.traverse, [markers.reference, "b"]],
      [markers.traverse, [markers.reference, "c"]],
    ]);
  });

  test("conditionalExpression", () => {
    assertParse("conditionalExpression", "1", [ops.literal, 1]);
    assertParse("conditionalExpression", "true ? 1 : 0", [
      ops.conditional,
      [markers.traverse, [markers.reference, "true"]],
      [ops.literal, 1],
      [ops.literal, 0],
    ]);
    assertParse("conditionalExpression", "false ? () => 1 : 0", [
      ops.conditional,
      [markers.traverse, [markers.reference, "false"]],
      [ops.lambda, [], [ops.lambda, [], [ops.literal, 1]]],
      [ops.literal, 0],
    ]);
    assertParse("conditionalExpression", "false ? =1 : 0", [
      ops.conditional,
      [markers.traverse, [markers.reference, "false"]],
      [ops.lambda, [], [ops.lambda, [[ops.literal, "_"]], [ops.literal, 1]]],
      [ops.literal, 0],
    ]);
  });

  test("equalityExpression", () => {
    assertParse("equalityExpression", "1 === 1", [
      ops.strictEqual,
      [ops.literal, 1],
      [ops.literal, 1],
    ]);
    assertParse("equalityExpression", "a === b === c", [
      ops.strictEqual,
      [
        ops.strictEqual,
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
      ],
      [markers.traverse, [markers.reference, "c"]],
    ]);
    assertParse("equalityExpression", "1 !== 1", [
      ops.notStrictEqual,
      [ops.literal, 1],
      [ops.literal, 1],
    ]);
  });

  test("error thrown for missing token", () => {
    assertThrows("arrowFunction", "(a) => ", "Expected an expression");
    assertThrows("arrowFunction", "a ⇒ ", "Expected an expression");
    assertThrows("callExpression", "fn(a", "Expected right parenthesis");
    assertThrows("doubleQuoteString", '"foo', "Expected closing quote");
    assertThrows("guillemetString", "«foo", "Expected closing guillemet");
    assertThrows("objectGetter", "a =", "Expected an expression");
    assertThrows("objectProperty", "a:", "Expected an expression");
    assertThrows("singleQuoteString", "'foo", "Expected closing quote");
    assertThrows("templateLiteral", "`foo", "Expected closing backtick");
  });

  test("error thrown for invalid Origami front matter expression", () => {
    assertThrows(
      "templateDocument",
      `---
(name) => foo)
---
Body`,
      'Expected "---"',
      { line: 2, column: 14 }
    );
  });

  test("error thrown for invalid YAML front matter", () => {
    assertThrows(
      "templateDocument",
      `---
a : 1
}
---
Body`,
      "Unexpected flow-map-end token",
      { line: 3, column: 1 }
    );
  });

  test("exponentiationExpression", () => {
    assertParse("exponentiationExpression", "2 ** 2 ** 3", [
      ops.exponentiation,
      [ops.literal, 2],
      [ops.exponentiation, [ops.literal, 2], [ops.literal, 3]],
    ]);
  });

  describe("expression", () => {
    test("slash with and without spaces", () => {
      assertParse("expression", "x/y", [
        markers.traverse,
        [markers.reference, "x/"],
        [ops.literal, "y"],
      ]);
      assertParse("expression", "x / y", [
        ops.division,
        [markers.traverse, [markers.reference, "x"]],
        [markers.traverse, [markers.reference, "y"]],
      ]);
      // Parses as a call, not a path
      assertParse("expression", "(x)/y", [
        [markers.traverse, [markers.reference, "x"]],
        [ops.literal, "y"],
      ]);
    });

    test("operators with spaces = math", () => {
      assertParse("expression", "a + b", [
        ops.addition,
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
      ]);
      assertParse("expression", "a - b", [
        ops.subtraction,
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
      ]);
      assertParse("expression", "a & b", [
        ops.bitwiseAnd,
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
      ]);
    });

    test("operators without spaces = reference", () => {
      assertParse("expression", "a+b", [
        markers.traverse,
        [markers.reference, "a+b"],
      ]);
      assertParse("expression", "a-b", [
        markers.traverse,
        [markers.reference, "a-b"],
      ]);
      assertParse("expression", "a&b", [
        markers.traverse,
        [markers.reference, "a&b"],
      ]);
    });

    test("property acccess", () => {
      assertParse("expression", "(foo).bar", [
        ops.property,
        [markers.traverse, [markers.reference, "foo"]],
        [ops.literal, "bar"],
      ]);
      assertParse("expression", "(foo).bar.baz", [
        ops.property,
        [
          ops.property,
          [markers.traverse, [markers.reference, "foo"]],
          [ops.literal, "bar"],
        ],
        [ops.literal, "baz"],
      ]);
      assertParse("expression", "foo[bar]", [
        ops.property,
        [markers.traverse, [markers.reference, "foo"]],
        [markers.traverse, [markers.reference, "bar"]],
      ]);
      assertParse("expression", "Tree.map", [
        markers.traverse,
        [markers.reference, "Tree.map"],
      ]);
    });

    test("consecutive slashes at start of something = comment", () => {
      assertParse(
        "expression",
        "x //comment",
        [markers.traverse, [markers.reference, "x"]],
        "program",
        false
      );
    });

    test("complex expressions", () => {
      assertParse("expression", "page.ori(mdHtml(about.md))", [
        [markers.traverse, [markers.reference, "page.ori"]],
        [
          [markers.traverse, [markers.reference, "mdHtml"]],
          [markers.traverse, [markers.reference, "about.md"]],
        ],
      ]);

      assertParse("expression", "keys(</>)", [
        [markers.traverse, [markers.reference, "keys"]],
        [markers.traverse, [markers.external, "/"]],
      ]);

      assertParse("expression", "'Hello' -> test.ori.html", [
        [markers.traverse, [markers.reference, "test.ori.html"]],
        [ops.literal, "Hello"],
      ]);
      assertParse("expression", "obj.json", [
        markers.traverse,
        [markers.reference, "obj.json"],
      ]);
      assertParse("expression", "(fn a, b, c)", [
        [markers.traverse, [markers.reference, "fn"]],
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
        [markers.traverse, [markers.reference, "c"]],
      ]);
      assertParse("expression", "foo.bar('hello', 'world')", [
        [markers.traverse, [markers.reference, "foo.bar"]],
        [ops.literal, "hello"],
        [ops.literal, "world"],
      ]);
      assertParse("expression", "(key)('a')", [
        [markers.traverse, [markers.reference, "key"]],
        [ops.literal, "a"],
      ]);
      assertParse("expression", "1", [ops.literal, 1]);
      assertParse("expression", "{ a: 1, b: 2 }", [
        ops.object,
        ["a", [ops.literal, 1]],
        ["b", [ops.literal, 2]],
      ]);
      assertParse("expression", "serve { index.html: 'hello' }", [
        [markers.traverse, [markers.reference, "serve"]],
        [ops.object, ["index.html", [ops.literal, "hello"]]],
      ]);
      assertParse("expression", "fn =`x`", [
        [markers.traverse, [markers.reference, "fn"]],
        [
          ops.lambda,
          [[ops.literal, "_"]],
          [ops.templateText, [ops.literal, ["x"]]],
        ],
      ]);
      assertParse("expression", "copy app.js(formulas), files:snapshot", [
        [markers.traverse, [markers.reference, "copy"]],
        [
          [markers.traverse, [markers.reference, "app.js"]],
          [markers.traverse, [markers.reference, "formulas"]],
        ],
        [
          [markers.global, "files:"],
          [ops.literal, "snapshot"],
        ],
      ]);
      assertParse("expression", "map =`<li>${_}</li>`", [
        [markers.traverse, [markers.reference, "map"]],
        [
          ops.lambda,
          [[ops.literal, "_"]],
          [
            ops.templateText,
            [ops.literal, ["<li>", "</li>"]],
            [markers.traverse, [markers.reference, "_"]],
          ],
        ],
      ]);
      assertParse("expression", `https://example.com/about/`, [
        [markers.global, "https:"],
        [ops.literal, "example.com/"],
        [ops.literal, "about/"],
      ]);
      assertParse("expression", "tag`Hello, ${name}!`", [
        [markers.traverse, [markers.reference, "tag"]],
        [ops.literal, ["Hello, ", "!"]],
        [ops.concat, [markers.traverse, [markers.reference, "name"]]],
      ]);
      assertParse("expression", "=tag`Hello, ${_}!`", [
        ops.lambda,
        [[ops.literal, "_"]],
        [
          [markers.traverse, [markers.reference, "tag"]],
          [ops.literal, ["Hello, ", "!"]],
          [ops.concat, [markers.traverse, [markers.reference, "_"]]],
        ],
      ]);
      assertParse("expression", "(post, slug) => fn.js(post, slug)", [
        ops.lambda,
        [
          [ops.literal, "post"],
          [ops.literal, "slug"],
        ],
        [
          [markers.traverse, [markers.reference, "fn.js"]],
          [markers.traverse, [markers.reference, "post"]],
          [markers.traverse, [markers.reference, "slug"]],
        ],
      ]);
      assertParse("expression", "keys(<~>)", [
        [markers.traverse, [markers.reference, "keys"]],
        [markers.traverse, [markers.external, "~"]],
      ]);
      assertParse("expression", "!x ? 0 : 1", [
        ops.conditional,
        [ops.logicalNot, [markers.traverse, [markers.reference, "x"]]],
        [ops.literal, 0],
        [ops.literal, 1],
      ]);
    });

    test("complex object", () => {
      assertParse(
        "expression",
        `{
        index.html = index.ori(teamData.yaml)
        thumbnails = map(images, { value: thumbnail.js })
      }`,
        [
          ops.object,
          [
            "index.html",
            [
              ops.getter,
              [
                [markers.traverse, [markers.reference, "index.ori"]],
                [markers.traverse, [markers.reference, "teamData.yaml"]],
              ],
            ],
          ],
          [
            "thumbnails",
            [
              ops.getter,
              [
                [markers.traverse, [markers.reference, "map"]],
                [markers.traverse, [markers.reference, "images"]],
                [
                  ops.object,
                  [
                    "value",
                    [markers.traverse, [markers.reference, "thumbnail.js"]],
                  ],
                ],
              ],
            ],
          ],
        ]
      );
    });
  });

  test("frontMatterExpression", () => {
    assertParse(
      "frontMatterExpression",
      `---
(name) => _template()
---
`,
      [
        ops.lambda,
        [[ops.literal, "name"]],
        [[markers.traverse, [markers.reference, "_template"]], undefined],
      ],
      "program",
      false
    );
  });

  test("group", () => {
    assertParse("group", "(hello)", [
      markers.traverse,
      [markers.reference, "hello"],
    ]);
    assertParse("group", "(((nested)))", [
      markers.traverse,
      [markers.reference, "nested"],
    ]);
    assertParse("group", "(fn())", [
      [markers.traverse, [markers.reference, "fn"]],
      undefined,
    ]);
    assertParse("group", "(a -> b)", [
      [markers.traverse, [markers.reference, "b"]],
      [markers.traverse, [markers.reference, "a"]],
    ]);
  });

  test("host", () => {
    assertParse("host", "abc", [ops.literal, "abc"]);
    assertParse("host", "abc:123", [ops.literal, "abc:123"]);
  });

  test("identifier", () => {
    assertParse("identifier", "foo", "foo", "program", false);
    assertParse("identifier", "$Δelta", "$Δelta", "program", false);
    assertThrows(
      "identifier",
      "1stCharacterIsNumber",
      "Expected JavaScript identifier start"
    );
    assertThrows(
      "identifier",
      "has space",
      "Expected JavaScript identifier continuation"
    );
    assertThrows(
      "identifier",
      "foo.bar",
      "Expected JavaScript identifier continuation"
    );
  });

  test("implicitParenthesesCallExpression", () => {
    assertParse("implicitParenthesesCallExpression", "fn arg", [
      [markers.traverse, [markers.reference, "fn"]],
      [markers.traverse, [markers.reference, "arg"]],
    ]);
    assertParse("implicitParenthesesCallExpression", "page.ori 'a', 'b'", [
      [markers.traverse, [markers.reference, "page.ori"]],
      [ops.literal, "a"],
      [ops.literal, "b"],
    ]);
    assertParse("implicitParenthesesCallExpression", "fn a(b), c", [
      [markers.traverse, [markers.reference, "fn"]],
      [
        [markers.traverse, [markers.reference, "a"]],
        [markers.traverse, [markers.reference, "b"]],
      ],
      [markers.traverse, [markers.reference, "c"]],
    ]);
    assertParse("implicitParenthesesCallExpression", "(fn()) 'arg'", [
      [[markers.traverse, [markers.reference, "fn"]], undefined],
      [ops.literal, "arg"],
    ]);
    assertParse(
      "implicitParenthesesCallExpression",
      "tree/key arg",
      [
        [markers.traverse, [markers.reference, "tree/"], [ops.literal, "key"]],
        [markers.traverse, [markers.reference, "arg"]],
      ],
      "shell"
    );
    assertParse("implicitParenthesesCallExpression", "foo.js bar.ori 'arg'", [
      [markers.traverse, [markers.reference, "foo.js"]],
      [
        [markers.traverse, [markers.reference, "bar.ori"]],
        [ops.literal, "arg"],
      ],
    ]);
  });

  test("key", () => {
    assertParse("key", "a", "a");
    assertParse("key", "_b", "_b");
    assertParse("key", ".ssh", ".ssh");
    assertParse("key", "index.html", "index.html");
    assertParse("key", "404.html", "404.html");
    assertParse("key", "1a2b3c", "1a2b3c");
    assertParse("key", "a~b", "a~b");
    assertParse("key", "foo-bar", "foo-bar");
    assertParse("key", "package-lock.json", "package-lock.json");
  });

  test("list", () => {
    assertParse("list", "1", [[ops.literal, 1]]);
    assertParse("list", "1,2,3", [
      [ops.literal, 1],
      [ops.literal, 2],
      [ops.literal, 3],
    ]);
    assertParse("list", "1, 2, 3,", [
      [ops.literal, 1],
      [ops.literal, 2],
      [ops.literal, 3],
    ]);
    assertParse("list", "1 , 2 , 3", [
      [ops.literal, 1],
      [ops.literal, 2],
      [ops.literal, 3],
    ]);
    assertParse("list", "1\n2\n3", [
      [ops.literal, 1],
      [ops.literal, 2],
      [ops.literal, 3],
    ]);
    assertParse("list", "'a' , 'b' , 'c'", [
      [ops.literal, "a"],
      [ops.literal, "b"],
      [ops.literal, "c"],
    ]);
  });

  test("logicalAndExpression", () => {
    assertParse("logicalAndExpression", "true && false", [
      ops.logicalAnd,
      [markers.traverse, [markers.reference, "true"]],
      [ops.lambda, [], [markers.traverse, [markers.reference, "false"]]],
    ]);
  });

  test("logicalOrExpression", () => {
    assertParse("logicalOrExpression", "1 || 0", [
      ops.logicalOr,
      [ops.literal, 1],
      [ops.literal, 0],
    ]);
    assertParse("logicalOrExpression", "false || false || true", [
      ops.logicalOr,
      [markers.traverse, [markers.reference, "false"]],
      [ops.lambda, [], [markers.traverse, [markers.reference, "false"]]],
      [ops.lambda, [], [markers.traverse, [markers.reference, "true"]]],
    ]);
    assertParse("logicalOrExpression", "1 || 2 && 0", [
      ops.logicalOr,
      [ops.literal, 1],
      [ops.lambda, [], [ops.logicalAnd, [ops.literal, 2], [ops.literal, 0]]],
    ]);
  });

  test("multiLineComment", () => {
    assertParse(
      "multiLineComment",
      "/*\nHello, world!\n*/",
      null,
      "program",
      false
    );
  });

  test("multiplicativeExpression", () => {
    assertParse("multiplicativeExpression", "3 * 4", [
      ops.multiplication,
      [ops.literal, 3],
      [ops.literal, 4],
    ]);
    assertParse("multiplicativeExpression", "5 / 2", [
      ops.division,
      [ops.literal, 5],
      [ops.literal, 2],
    ]);
    assertParse("multiplicativeExpression", "6 % 5", [
      ops.remainder,
      [ops.literal, 6],
      [ops.literal, 5],
    ]);
  });

  test("newExpression", () => {
    assertParse("newExpression", "new Foo()", [
      ops.construct,
      [markers.traverse, [markers.reference, "Foo"]],
    ]);
    assertParse("newExpression", "new:Foo()", [
      ops.construct,
      [markers.traverse, [markers.reference, "Foo"]],
    ]);
  });

  test("nullishCoalescingExpression", () => {
    assertParse("nullishCoalescingExpression", "a ?? b", [
      ops.nullishCoalescing,
      [markers.traverse, [markers.reference, "a"]],
      [ops.lambda, [], [markers.traverse, [markers.reference, "b"]]],
    ]);
    assertParse("nullishCoalescingExpression", "a ?? b ?? c", [
      ops.nullishCoalescing,
      [markers.traverse, [markers.reference, "a"]],
      [ops.lambda, [], [markers.traverse, [markers.reference, "b"]]],
      [ops.lambda, [], [markers.traverse, [markers.reference, "c"]]],
    ]);
  });

  test("numericLiteral", () => {
    assertParse("numericLiteral", "123", [ops.literal, 123]);
    assertParse("numericLiteral", ".5", [ops.literal, 0.5]);
    assertParse("numericLiteral", "123.45", [ops.literal, 123.45]);
  });

  describe("objectLiteral", () => {
    describe("basic objects", () => {
      assertParse("objectLiteral", "{}", [ops.object]);
      assertParse("objectLiteral", "{ a: 1, b }", [
        ops.object,
        ["a", [ops.literal, 1]],
        ["b", [markers.traverse, [markers.reference, "b"]]],
      ]);
      assertParse("objectLiteral", "{ sub: { a: 1 } }", [
        ops.object,
        ["sub", [ops.object, ["a", [ops.literal, 1]]]],
      ]);
      assertParse("objectLiteral", "{ sub: { a/: 1 } }", [
        ops.object,
        ["sub", [ops.object, ["a/", [ops.literal, 1]]]],
      ]);
      assertParse("objectLiteral", `{ "a": 1, "b": 2 }`, [
        ops.object,
        ["a", [ops.literal, 1]],
        ["b", [ops.literal, 2]],
      ]);
      assertParse("objectLiteral", "{ a = b, b = 2 }", [
        ops.object,
        ["a", [ops.getter, [markers.traverse, [markers.reference, "b"]]]],
        ["b", [ops.literal, 2]],
      ]);
      assertParse(
        "objectLiteral",
        `{
        a = b
        b = 2
      }`,
        [
          ops.object,
          ["a", [ops.getter, [markers.traverse, [markers.reference, "b"]]]],
          ["b", [ops.literal, 2]],
        ]
      );
      assertParse("objectLiteral", "{ a: { b: 1 } }", [
        ops.object,
        ["a", [ops.object, ["b", [ops.literal, 1]]]],
      ]);
      assertParse("objectLiteral", "{ a: { b = 1 } }", [
        ops.object,
        ["a", [ops.object, ["b", [ops.literal, 1]]]],
      ]);
      assertParse("objectLiteral", "{ a: { b = fn() } }", [
        ops.object,
        [
          "a",
          [
            ops.object,
            [
              "b",
              [
                ops.getter,
                [[markers.traverse, [markers.reference, "fn"]], undefined],
              ],
            ],
          ],
        ],
      ]);
      assertParse("objectLiteral", "{ x = fn.js('a') }", [
        ops.object,
        [
          "x",
          [
            ops.getter,
            [
              [markers.traverse, [markers.reference, "fn.js"]],
              [ops.literal, "a"],
            ],
          ],
        ],
      ]);

      assertParse("objectLiteral", "{ (a): 1 }", [
        ops.object,
        ["(a)", [ops.literal, 1]],
      ]);
      assertParse("objectLiteral", "{ <path/to/file.txt> }", [
        ops.object,
        [
          "file.txt",
          [
            markers.traverse,
            [markers.external, "path/"],
            [ops.literal, "to/"],
            [ops.literal, "file.txt"],
          ],
        ],
      ]);
    });

    describe("spreads", () => {
      assertParse("objectLiteral", "{ ...x }", [
        ops.unpack,
        [markers.traverse, [markers.reference, "x"]],
      ]);
      assertParse("objectLiteral", "{ a: 1, ...more, c: a }", [
        [
          ops.object,
          ["a", [ops.literal, 1]],
          ["c", [markers.traverse, [markers.reference, "a"]]],
          [
            "_result",
            [
              ops.merge,
              [ops.object, ["a", [ops.getter, [[ops.context, 1], "a"]]]],
              [markers.traverse, [markers.reference, "more"]],
              [ops.object, ["c", [ops.getter, [[ops.context, 1], "c"]]]],
            ],
          ],
        ],
        "_result",
      ]);
      assertParse("objectLiteral", "{ a: 1, ...{ b: 2 } }", [
        ops.object,
        ["a", [ops.literal, 1]],
        ["b", [ops.literal, 2]],
      ]);
    });
  });

  describe("objectEntry", () => {
    test("shorthand", () => {
      assertParse("objectEntry", "foo", [
        "foo",
        [markers.traverse, [markers.reference, "foo"]],
      ]);
      assertParse("objectEntry", "folder/", [
        "folder/",
        [ops.unpack, [markers.traverse, [markers.reference, "folder/"]]],
      ]);
      assertParse("objectEntry", "path/to/file.txt", [
        "file.txt",
        [
          markers.traverse,
          [markers.reference, "path/"],
          [ops.literal, "to/"],
          [ops.literal, "file.txt"],
        ],
      ]);
      assertParse("objectEntry", "<folder/>", [
        "folder/",
        [markers.traverse, [markers.external, "folder/"]],
      ]);
      assertParse("objectEntry", "<path/to/file.txt>", [
        "file.txt",
        [
          markers.traverse,
          [markers.external, "path/"],
          [ops.literal, "to/"],
          [ops.literal, "file.txt"],
        ],
      ]);
    });

    test("key: value", () => {
      assertParse("objectEntry", "index.html: x", [
        "index.html",
        [markers.traverse, [markers.reference, "x"]],
      ]);
      assertParse("objectEntry", "a: a", [
        "a",
        [markers.traverse, [markers.reference, "a"]],
      ]);
      assertParse("objectEntry", "a: (a) => a", [
        "a",
        [
          ops.lambda,
          [[ops.literal, "a"]],
          [markers.traverse, [markers.reference, "a"]],
        ],
      ]);
      assertParse("objectEntry", "posts/: map(posts, post.ori)", [
        "posts/",
        [
          [markers.traverse, [markers.reference, "map"]],
          [markers.traverse, [markers.reference, "posts"]],
          [markers.traverse, [markers.reference, "post.ori"]],
        ],
      ]);
    });
  });

  test("objectGetter", () => {
    assertParse("objectGetter", "data = obj.json", [
      "data",
      [ops.getter, [markers.traverse, [markers.reference, "obj.json"]]],
    ]);
    assertParse("objectGetter", "index.html = index.ori(teamData.yaml)", [
      "index.html",
      [
        ops.getter,
        [
          [markers.traverse, [markers.reference, "index.ori"]],
          [markers.traverse, [markers.reference, "teamData.yaml"]],
        ],
      ],
    ]);
  });

  test("objectProperty", () => {
    assertParse("objectProperty", "a: 1", ["a", [ops.literal, 1]]);
    assertParse("objectProperty", "data.json: 'Alice'", [
      "data.json",
      [ops.literal, "Alice"],
    ]);
    assertParse("objectProperty", "x: fn('a')", [
      "x",
      [
        [markers.traverse, [markers.reference, "fn"]],
        [ops.literal, "a"],
      ],
    ]);
  });

  test("objectPublicKey", () => {
    assertParse("objectPublicKey", "a", "a", "shell", false);
    assertParse("objectPublicKey", "index.html", "index.html", "shell", false);
    assertParse("objectPublicKey", "markdown/", "markdown/", "shell", false);
    assertParse("objectPublicKey", `"foo bar"`, "foo bar", "shell", false);
  });

  test.skip("optionalChaining", () => {
    assertParse("optionalChaining", "?.key", [
      ops.optionalTraverse,
      [ops.literal, "key"],
    ]);
  });

  test("parenthesesArguments", () => {
    assertParse("parenthesesArguments", "()", [undefined]);
    assertParse("parenthesesArguments", "(a, b, c)", [
      [markers.traverse, [markers.reference, "a"]],
      [markers.traverse, [markers.reference, "b"]],
      [markers.traverse, [markers.reference, "c"]],
    ]);
  });

  test("pathKeys", () => {
    assertParse(
      "pathKeys",
      "tree/",
      [[ops.literal, "tree/"]],
      undefined,
      false
    );
    assertParse(
      "pathKeys",
      "month/12",
      [
        [ops.literal, "month/"],
        [ops.literal, "12"],
      ],
      undefined,
      false
    );
    assertParse(
      "pathKeys",
      "tree/foo/bar",
      [
        [ops.literal, "tree/"],
        [ops.literal, "foo/"],
        [ops.literal, "bar"],
      ],
      undefined,
      false
    );
    assertParse(
      "pathKeys",
      "a///b",
      [
        [ops.literal, "a/"],
        [ops.literal, "/"],
        [ops.literal, "/"],
        [ops.literal, "b"],
      ],
      undefined,
      false
    );
  });

  test("pathArguments", () => {
    assertParse("pathArguments", "/", [markers.traverse]);
    assertParse("pathArguments", "/tree", [
      markers.traverse,
      [ops.literal, "tree"],
    ]);
    assertParse("pathArguments", "/tree/", [
      markers.traverse,
      [ops.literal, "tree/"],
    ]);
  });

  test("pathLiteral", () => {
    assertParse("pathLiteral", "tree", [
      markers.traverse,
      [markers.reference, "tree"],
    ]);
    assertParse("pathLiteral", "tree/", [
      ops.unpack,
      [markers.traverse, [markers.reference, "tree/"]],
    ]);
    assertParse("pathLiteral", "month/12", [
      markers.traverse,
      [markers.reference, "month/"],
      [ops.literal, "12"],
    ]);
    assertParse("pathLiteral", "a/b/c/", [
      ops.unpack,
      [
        markers.traverse,
        [markers.reference, "a/"],
        [ops.literal, "b/"],
        [ops.literal, "c/"],
      ],
    ]);
    assertParse("pathLiteral", "~/.cshrc", [
      markers.traverse,
      [markers.reference, "~/"],
      [ops.literal, ".cshrc"],
    ]);
  });

  test("pipelineExpression", () => {
    assertParse("pipelineExpression", "foo", [
      markers.traverse,
      [markers.reference, "foo"],
    ]);
    assertParse("pipelineExpression", "a -> b", [
      [markers.traverse, [markers.reference, "b"]],
      [markers.traverse, [markers.reference, "a"]],
    ]);
    assertParse("pipelineExpression", "input → one.js → two.js", [
      [markers.traverse, [markers.reference, "two.js"]],
      [
        [markers.traverse, [markers.reference, "one.js"]],
        [markers.traverse, [markers.reference, "input"]],
      ],
    ]);
    assertParse("pipelineExpression", "fn a -> b", [
      [markers.traverse, [markers.reference, "b"]],
      [
        [markers.traverse, [markers.reference, "fn"]],
        [markers.traverse, [markers.reference, "a"]],
      ],
    ]);
  });

  test("primary", () => {
    assertParse("primary", "123", [ops.literal, 123]);
    assertParse("primary", "123.html", [
      markers.traverse,
      [markers.reference, "123.html"],
    ]);
    assertParse("primary", "foo.js", [
      markers.traverse,
      [markers.reference, "foo.js"],
    ]);
    assertParse("primary", "[1, 2]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, 2],
    ]);
    assertParse("primary", "<index.html>", [
      markers.traverse,
      [markers.external, "index.html"],
    ]);
  });

  test("program", () => {
    assertParse(
      "program",
      `#!/usr/bin/env ori invoke
'Hello'
`,
      [ops.literal, "Hello"],
      "program",
      false
    );
  });

  test("regexLiteral", () => {
    assertParse("regexLiteral", "/abc+/g", [ops.literal, /abc+/g]);
  });

  test("relationalExpression", () => {
    assertParse("relationalExpression", "1 < 2", [
      ops.lessThan,
      [ops.literal, 1],
      [ops.literal, 2],
    ]);
    assertParse("relationalExpression", "3 > 4", [
      ops.greaterThan,
      [ops.literal, 3],
      [ops.literal, 4],
    ]);
    assertParse("relationalExpression", "5 <= 6", [
      ops.lessThanOrEqual,
      [ops.literal, 5],
      [ops.literal, 6],
    ]);
    assertParse("relationalExpression", "7 >= 8", [
      ops.greaterThanOrEqual,
      [ops.literal, 7],
      [ops.literal, 8],
    ]);
  });

  test("shiftExpression", () => {
    assertParse("shiftExpression", "1 << 2", [
      ops.shiftLeft,
      [ops.literal, 1],
      [ops.literal, 2],
    ]);
    assertParse("shiftExpression", "3 >> 4", [
      ops.shiftRightSigned,
      [ops.literal, 3],
      [ops.literal, 4],
    ]);
    assertParse("shiftExpression", "5 >>> 6", [
      ops.shiftRightUnsigned,
      [ops.literal, 5],
      [ops.literal, 6],
    ]);
  });

  test("shorthandFunction", () => {
    assertParse("shorthandFunction", "=message", [
      ops.lambda,
      [[ops.literal, "_"]],
      [markers.traverse, [markers.reference, "message"]],
    ]);
    assertParse("shorthandFunction", "=`Hello, ${name}.`", [
      ops.lambda,
      [[ops.literal, "_"]],
      [
        ops.templateText,
        [ops.literal, ["Hello, ", "."]],
        [markers.traverse, [markers.reference, "name"]],
      ],
    ]);
    assertParse("shorthandFunction", "=indent`hello`", [
      ops.lambda,
      [[ops.literal, "_"]],
      [
        [markers.traverse, [markers.reference, "indent"]],
        [ops.literal, ["hello"]],
      ],
    ]);
  });

  test("singleLineComment", () => {
    assertParse(
      "singleLineComment",
      "// Hello, world!",
      null,
      "program",
      false
    );
  });

  test("spreadElement", () => {
    assertParse("spreadElement", "...a", [
      ops.spread,
      [markers.traverse, [markers.reference, "a"]],
    ]);
  });

  test("stringLiteral", () => {
    assertParse("stringLiteral", '"foo"', [ops.literal, "foo"]);
    assertParse("stringLiteral", "'bar'", [ops.literal, "bar"]);
    assertParse("stringLiteral", '"foo bar"', [ops.literal, "foo bar"]);
    assertParse("stringLiteral", "'bar baz'", [ops.literal, "bar baz"]);
    assertParse("stringLiteral", `"foo\\"s bar"`, [ops.literal, `foo"s bar`]);
    assertParse("stringLiteral", `'bar\\'s baz'`, [ops.literal, `bar's baz`]);
    assertParse("stringLiteral", `«string»`, [ops.literal, "string"]);
    assertParse("stringLiteral", `"\\0\\b\\f\\n\\r\\t\\v"`, [
      ops.literal,
      "\0\b\f\n\r\t\v",
    ]);
  });

  test("templateBody", () => {
    assertParse("templateBody", "hello${foo}world", [
      ops.templateIndent,
      [ops.literal, ["hello", "world"]],
      [markers.traverse, [markers.reference, "foo"]],
    ]);
    assertParse("templateBody", "Documents can contain ` backticks", [
      ops.templateIndent,
      [ops.literal, ["Documents can contain ` backticks"]],
    ]);
  });

  test("templateDocument with no front matter", () => {
    assertParse("templateDocument", "Hello, world!", [
      ops.lambda,
      [[ops.literal, "_"]],
      [ops.templateIndent, [ops.literal, ["Hello, world!"]]],
    ]);
  });

  test("templateDocument with YAML front matter", () => {
    assertParse(
      "templateDocument",
      `---
title: Title goes here
---
Body text`,
      [
        ops.object,
        ["title", [ops.literal, "Title goes here"]],
        ["_body", [ops.templateIndent, [ops.literal, ["Body text"]]]],
      ]
    );
  });

  test("templateDocument with Origami front matter", () => {
    assertParse(
      "templateDocument",
      `---
{
  title: "Title"
  _body: _template()
}
---
<h1>\${ title }</h1>
`,
      [
        ops.object,
        ["title", [ops.literal, "Title"]],
        [
          "_body",
          [
            ops.templateIndent,
            [ops.literal, ["<h1>", "</h1>\n"]],
            [markers.traverse, [markers.reference, "title"]],
          ],
        ],
      ],
      "shell"
    );
  });

  test.skip("templateDocument with Origami front matter", () => {
    assertParse(
      "templateDocument",
      `---
{
  title: "Title"
  _body: _template()
}
---
<h1>\${ title }</h1>
`,
      [
        ops.object,
        ["title", [ops.literal, "Title"]],
        [
          "_body",
          [
            ops.templateIndent,
            [ops.literal, ["<h1>", "</h1>\n"]],
            [markers.traverse, [markers.reference, "title"]],
          ],
        ],
      ]
    );
  });

  test("templateLiteral", () => {
    assertParse("templateLiteral", "`Hello, world.`", [
      ops.templateText,
      [ops.literal, ["Hello, world."]],
    ]);
    assertParse("templateLiteral", "`Hello, world.`", [
      ops.templateText,
      [ops.literal, ["Hello, world."]],
    ]);
    assertParse("templateLiteral", "`foo ${x} bar`", [
      ops.templateText,
      [ops.literal, ["foo ", " bar"]],
      [markers.traverse, [markers.reference, "x"]],
    ]);
    assertParse("templateLiteral", "`${`nested`}`", [
      ops.templateText,
      [ops.literal, ["", ""]],
      [ops.templateText, [ops.literal, ["nested"]]],
    ]);
    assertParse("templateLiteral", "`${ map(people, =`${name}`) }`", [
      ops.templateText,
      [ops.literal, ["", ""]],
      [
        [markers.traverse, [markers.reference, "map"]],
        [markers.traverse, [markers.reference, "people"]],
        [
          ops.lambda,
          [[ops.literal, "_"]],
          [
            ops.templateText,
            [ops.literal, ["", ""]],
            [markers.traverse, [markers.reference, "name"]],
          ],
        ],
      ],
    ]);
  });

  test("templateSubtitution", () => {
    assertParse(
      "templateSubstitution",
      "${foo}",
      [markers.traverse, [markers.reference, "foo"]],
      "shell",
      false
    );
  });

  describe("uri", () => {
    test("with double slashes after colon", () => {
      assertParse("uri", "foo://bar/baz", [
        [markers.global, "foo:"],
        [ops.literal, "bar/"],
        [ops.literal, "baz"],
      ]);
      assertParse("uri", "http://example.com", [
        [markers.global, "http:"],
        [ops.literal, "example.com"],
      ]);
      assertParse("uri", "https://example.com/about/", [
        [markers.global, "https:"],
        [ops.literal, "example.com/"],
        [ops.literal, "about/"],
      ]);
      assertParse("uri", "https://example.com/about/index.html", [
        [markers.global, "https:"],
        [ops.literal, "example.com/"],
        [ops.literal, "about/"],
        [ops.literal, "index.html"],
      ]);
      assertParse("uri", "http://localhost:5000/foo", [
        [markers.global, "http:"],
        [ops.literal, "localhost:5000/"],
        [ops.literal, "foo"],
      ]);
    });

    test("without double slashes after colon", () => {
      assertParse("uri", "files:build", [
        [markers.global, "files:"],
        [ops.literal, "build"],
      ]);
    });
  });

  test("uriScheme", () => {
    assertParse("uriScheme", "https:", [markers.global, "https:"]);
  });

  test("unaryExpression", () => {
    assertParse("unaryExpression", "!true", [
      ops.logicalNot,
      [markers.traverse, [markers.reference, "true"]],
    ]);
    assertParse("unaryExpression", "+1", [ops.unaryPlus, [ops.literal, 1]]);
    assertParse("unaryExpression", "-2", [ops.unaryMinus, [ops.literal, 2]]);
    assertParse("unaryExpression", "~3", [ops.bitwiseNot, [ops.literal, 3]]);
    assertParse("unaryExpression", "typeof 1", [ops.typeOf, [ops.literal, 1]]);
    assertParse("unaryExpression", "void 0", [ops.voidOp, [ops.literal, 0]]);
    assertParse("unaryExpression", "await 2", [ops.literal, 2]);
  });

  test("unaryOperator", () => {
    assertParse("unaryOperator", "!", "!");
    assertParse("unaryOperator", "+", "+");
    assertParse("unaryOperator", "-", "-");
    assertParse("unaryOperator", "~", "~");
  });

  test("whitespace block", () => {
    assertParse(
      "__",
      `  
  // First comment
  // Second comment
     `,
      null,
      "program",
      false
    );
  });
});

function assertParse(
  startRule,
  source,
  expected,
  mode = "shell",
  checkLocation = true
) {
  const code = parse(source, {
    grammarSource: { text: source },
    mode,
    startRule,
  });

  // Verify that the parser returned a `location` property and that it spans the
  // entire source. We skip this check in cases where the source starts or ends
  // with a comment; the parser will strip those.
  if (typeof code === "object" && checkLocation) {
    assertCodeLocations(code);
    const resultSource = code.location.source.text.slice(
      code.location.start.offset,
      code.location.end.offset
    );
    assert.equal(resultSource, source);
  }

  assertCodeEqual(code, expected);
}

function assertThrows(startRule, source, message, position, mode = "program") {
  // @ts-ignore We declare this so we can inspect it in debugger
  let code;
  try {
    code = parse(source, {
      grammarSource: { text: source },
      mode,
      startRule,
    });
  } catch (/** @type {any} */ error) {
    assert(
      error.message.includes(message),
      `Error message incorrect:\n  expected: "${message}"\n  actual: "${error.message}"`
    );
    if (position) {
      assert.equal(error.location.start.line, position.line);
      assert.equal(error.location.start.column, position.column);
    }
    return;
  }
  assert.fail(`Expected error: ${message}`);
}
