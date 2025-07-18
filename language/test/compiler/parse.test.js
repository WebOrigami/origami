import assert from "node:assert";
import { describe, test } from "node:test";
import { parse } from "../../src/compiler/parse.js";
import { markers } from "../../src/compiler/parserHelpers.js";
import * as ops from "../../src/runtime/ops.js";
import { assertCodeEqual } from "./codeHelpers.js";

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
        [ops.scope],
        [ops.literal, "index.html"],
      ]);
      assertParse(
        "angleBracketLiteral",
        "<Path with spaces (and parens).html>",
        [[ops.scope], [ops.literal, "Path with spaces (and parens).html"]]
      );
      assertParse("angleBracketLiteral", "<foo/bar/baz>", [
        [ops.scope],
        [ops.literal, "foo/"],
        [ops.literal, "bar/"],
        [ops.literal, "baz"],
      ]);
    });

    test("root directory", () => {
      assertParse("angleBracketLiteral", "</>", [ops.rootDirectory]);
      assertParse("angleBracketLiteral", "</etc/passwd>", [
        [ops.rootDirectory],
        [ops.literal, "etc/"],
        [ops.literal, "passwd"],
      ]);
    });

    test("home directory", () => {
      assertParse("angleBracketLiteral", "<~>", [ops.homeDirectory]);
      assertParse("angleBracketLiteral", "<~/.bash_profile>", [
        [ops.homeDirectory],
        [ops.literal, ".bash_profile"],
      ]);
    });

    test("with protocol URL", () => {
      assertParse("angleBracketLiteral", "<files:src/assets>", [
        [markers.global, "files:"],
        [ops.literal, "src/"],
        [ops.literal, "assets"],
      ]);
      assertParse(
        "angleBracketLiteral",
        "<https://example.com/data.yaml>",
        [
          [markers.global, "https:"],
          [ops.literal, "example.com/"],
          [ops.literal, "data.yaml"],
        ],
        "jse"
      );
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
      [markers.reference, "foo"],
    ]);
    assertParse("arrowFunction", "x => y", [
      ops.lambda,
      [[ops.literal, "x"]],
      [markers.reference, "y"],
    ]);
    assertParse("arrowFunction", "(a, b, c) ⇒ fn(a, b, c)", [
      ops.lambda,
      [
        [ops.literal, "a"],
        [ops.literal, "b"],
        [ops.literal, "c"],
      ],
      [
        [markers.reference, "fn"],
        [markers.reference, "a"],
        [markers.reference, "b"],
        [markers.reference, "c"],
      ],
    ]);
    assertParse("arrowFunction", "a => b => fn(a, b)", [
      ops.lambda,
      [[ops.literal, "a"]],
      [
        ops.lambda,
        [[ops.literal, "b"]],
        [
          [markers.reference, "fn"],
          [markers.reference, "a"],
          [markers.reference, "b"],
        ],
      ],
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
        [markers.reference, "fn"],
        undefined,
      ]);
      assertParse("callExpression", "foo.js(arg)", [
        [markers.dots, [ops.literal, "foo"], [ops.literal, "js"]],
        [markers.reference, "arg"],
      ]);
      assertParse("callExpression", "fn(a, b)", [
        [markers.reference, "fn"],
        [markers.reference, "a"],
        [markers.reference, "b"],
      ]);
      assertParse("callExpression", "foo.js( a , b )", [
        [markers.dots, [ops.literal, "foo"], [ops.literal, "js"]],
        [markers.reference, "a"],
        [markers.reference, "b"],
      ]);
      assertParse("callExpression", "fn()(arg)", [
        [[markers.reference, "fn"], undefined],
        [markers.reference, "arg"],
      ]);
    });

    test("call chains", () => {
      assertParse("callExpression", "(foo.js())('arg')", [
        [[markers.dots, [ops.literal, "foo"], [ops.literal, "js"]], undefined],
        [ops.literal, "arg"],
      ]);
      assertParse("callExpression", "fn('a')('b')", [
        [
          [markers.reference, "fn"],
          [ops.literal, "a"],
        ],
        [ops.literal, "b"],
      ]);
      assertParse("callExpression", "(foo.js())(a, b)", [
        [[markers.dots, [ops.literal, "foo"], [ops.literal, "js"]], undefined],
        [markers.reference, "a"],
        [markers.reference, "b"],
      ]);
    });

    test("with paths", () => {
      assertParse("callExpression", "tree/", [
        [ops.scope],
        [ops.literal, "tree/"],
      ]);
      assertParse("callExpression", "tree/foo/bar", [
        markers.path,
        [ops.literal, "tree"],
        [ops.literal, "foo"],
        [ops.literal, "bar"],
      ]);
      assertParse("callExpression", "tree/foo/bar/", [
        [ops.scope],
        [ops.literal, "tree/"],
        [ops.literal, "foo/"],
        [ops.literal, "bar/"],
      ]);
      // Consecutive slahes in a path are removed
      assertParse("callExpression", "tree//key", [
        markers.path,
        [ops.literal, "tree"],
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
        [[markers.dots, [ops.literal, "foo"], [ops.literal, "js"]], undefined],
        [ops.literal, "key"],
      ]);
      assertParse("callExpression", "tree/key()", [
        [markers.path, [ops.literal, "tree"], [ops.literal, "key"]],
        undefined,
      ]);
      assertParse("callExpression", "fn()/key()", [
        [
          [[markers.reference, "fn"], undefined],
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
        [markers.reference, "creds"],
      ]);
    });

    test("tagged templates", () => {
      assertParse("callExpression", "indent`hello`", [
        [markers.reference, "indent"],
        [ops.literal, ["hello"]],
      ]);
      assertParse("callExpression", "fn.js`Hello, world.`", [
        [markers.dots, [ops.literal, "fn"], [ops.literal, "js"]],
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
        [
          [markers.global, "node:"],
          [ops.literal, "process"],
        ],
        [ops.literal, "env"],
      ]);
    });
  });

  test("callExpression using property acccess", () => {
    assertParse("callExpression", "(foo).bar", [
      [markers.reference, "foo"],
      [ops.literal, "bar"],
    ]);
    assertParse("callExpression", "(foo).bar.baz", [
      [
        [markers.reference, "foo"],
        [ops.literal, "bar"],
      ],
      [ops.literal, "baz"],
    ]);
    assertParse("callExpression", "foo[bar]", [
      [markers.reference, "foo"],
      [markers.reference, "bar"],
    ]);
    assertParse(
      "callExpression",
      "Tree.map",
      [markers.dots, [ops.literal, "Tree"], [ops.literal, "map"]],
      "jse"
    );
  });

  test("commaExpression", () => {
    assertParse("commaExpression", "1", [ops.literal, 1]);
    assertParse("commaExpression", "a, b, c", [
      ops.comma,
      [markers.reference, "a"],
      [markers.reference, "b"],
      [markers.reference, "c"],
    ]);
  });

  test("conditionalExpression", () => {
    assertParse("conditionalExpression", "1", [ops.literal, 1]);
    assertParse("conditionalExpression", "true ? 1 : 0", [
      ops.conditional,
      [markers.reference, "true"],
      [ops.literal, 1],
      [ops.literal, 0],
    ]);
    assertParse("conditionalExpression", "false ? () => 1 : 0", [
      ops.conditional,
      [markers.reference, "false"],
      [ops.lambda, [], [ops.lambda, [], [ops.literal, 1]]],
      [ops.literal, 0],
    ]);
    assertParse("conditionalExpression", "false ? =1 : 0", [
      ops.conditional,
      [markers.reference, "false"],
      [ops.lambda, [], [ops.lambda, [[ops.literal, "_"]], [ops.literal, 1]]],
      [ops.literal, 0],
    ]);
  });

  test("dotChain", () => {
    assertParse("dotChain", "x", [markers.reference, "x"]);
    assertParse("dotChain", "a.b.c", [
      markers.dots,
      [ops.literal, "a"],
      [ops.literal, "b"],
      [ops.literal, "c"],
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
      [ops.strictEqual, [markers.reference, "a"], [markers.reference, "b"]],
      [markers.reference, "c"],
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

  test("expression", () => {
    // Deprecated (x)/y syntax for traversal
    assertParse(
      "expression",
      "(x)/y",
      [
        [markers.reference, "x"],
        [ops.literal, "y"],
      ],
      "shell"
    );
    assertParse(
      "expression",
      "(x)/y",
      [ops.division, [markers.reference, "x"], [markers.reference, "y"]],
      "jse"
    );

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
              [markers.dots, [ops.literal, "index"], [ops.literal, "ori"]],
              [markers.dots, [ops.literal, "teamData"], [ops.literal, "yaml"]],
            ],
          ],
        ],
        [
          "thumbnails",
          [
            ops.getter,
            [
              [markers.reference, "map"],
              [markers.reference, "images"],
              [
                ops.object,
                [
                  "value",
                  [
                    markers.dots,
                    [ops.literal, "thumbnail"],
                    [ops.literal, "js"],
                  ],
                ],
              ],
            ],
          ],
        ],
      ]
    );

    // Consecutive slashes at start of something = comment
    assertParse(
      "expression",
      "x //comment",
      [markers.reference, "x"],
      "jse",
      false
    );

    assertParse("expression", "page.ori(mdHtml(about.md))", [
      [markers.dots, [ops.literal, "page"], [ops.literal, "ori"]],
      [
        [markers.reference, "mdHtml"],
        [markers.dots, [ops.literal, "about"], [ops.literal, "md"]],
      ],
    ]);

    assertParse("expression", "keys </>", [
      [markers.reference, "keys"],
      [ops.rootDirectory],
    ]);

    assertParse("expression", "'Hello' -> test.ori.html", [
      [
        markers.dots,
        [ops.literal, "test"],
        [ops.literal, "ori"],
        [ops.literal, "html"],
      ],
      [ops.literal, "Hello"],
    ]);
    assertParse("expression", "obj.json", [
      markers.dots,
      [ops.literal, "obj"],
      [ops.literal, "json"],
    ]);
    assertParse("expression", "(fn a, b, c)", [
      [markers.reference, "fn"],
      [markers.reference, "a"],
      [markers.reference, "b"],
      [markers.reference, "c"],
    ]);
    assertParse("expression", "foo.bar('hello', 'world')", [
      [markers.dots, [ops.literal, "foo"], [ops.literal, "bar"]],
      [ops.literal, "hello"],
      [ops.literal, "world"],
    ]);
    assertParse("expression", "(key)('a')", [
      [markers.reference, "key"],
      [ops.literal, "a"],
    ]);
    assertParse("expression", "1", [ops.literal, 1]);
    assertParse("expression", "{ a: 1, b: 2 }", [
      ops.object,
      ["a", [ops.literal, 1]],
      ["b", [ops.literal, 2]],
    ]);
    assertParse("expression", "serve { index.html: 'hello' }", [
      [markers.reference, "serve"],
      [ops.object, ["index.html", [ops.literal, "hello"]]],
    ]);
    assertParse("expression", "fn =`x`", [
      [markers.reference, "fn"],
      [
        ops.lambda,
        [[ops.literal, "_"]],
        [ops.templateTree, [ops.literal, ["x"]]],
      ],
    ]);
    assertParse("expression", "copy app.js(formulas), files:snapshot", [
      [markers.reference, "copy"],
      [
        [markers.dots, [ops.literal, "app"], [ops.literal, "js"]],
        [markers.reference, "formulas"],
      ],
      [
        [markers.global, "files:"],
        [ops.literal, "snapshot"],
      ],
    ]);
    assertParse("expression", "map =`<li>${_}</li>`", [
      [markers.reference, "map"],
      [
        ops.lambda,
        [[ops.literal, "_"]],
        [
          ops.templateTree,
          [ops.literal, ["<li>", "</li>"]],
          [markers.reference, "_"],
        ],
      ],
    ]);
    assertParse("expression", `https://example.com/about/`, [
      [markers.global, "https:"],
      [ops.literal, "example.com/"],
      [ops.literal, "about/"],
    ]);
    assertParse("expression", "tag`Hello, ${name}!`", [
      [markers.reference, "tag"],
      [ops.literal, ["Hello, ", "!"]],
      [ops.concat, [markers.reference, "name"]],
    ]);
    assertParse("expression", "(post, slug) => fn.js(post, slug)", [
      ops.lambda,
      [
        [ops.literal, "post"],
        [ops.literal, "slug"],
      ],
      [
        [markers.dots, [ops.literal, "fn"], [ops.literal, "js"]],
        [markers.reference, "post"],
        [markers.reference, "slug"],
      ],
    ]);
    assertParse("expression", "keys <~>", [
      [markers.reference, "keys"],
      [ops.homeDirectory],
    ]);

    // Verify parser treatment of identifiers containing operators
    assertParse("expression", "a + b", [
      ops.addition,
      [markers.reference, "a"],
      [markers.reference, "b"],
    ]);
    assertParse("expression", "a - b", [
      ops.subtraction,
      [markers.reference, "a"],
      [markers.reference, "b"],
    ]);
    assertParse("expression", "a & b", [
      ops.bitwiseAnd,
      [markers.reference, "a"],
      [markers.reference, "b"],
    ]);
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
        [[markers.reference, "_template"], undefined],
      ],
      "jse",
      false
    );
  });

  test("group", () => {
    assertParse("group", "(hello)", [markers.reference, "hello"]);
    assertParse("group", "(((nested)))", [markers.reference, "nested"]);
    assertParse("group", "(fn())", [[markers.reference, "fn"], undefined]);
    assertParse("group", "(a -> b)", [
      [markers.reference, "b"],
      [markers.reference, "a"],
    ]);
  });

  test("homeDirectory", () => {
    assertParse("homeDirectory", "~", [ops.homeDirectory]);
  });

  test("host", () => {
    assertParse("host", "abc", [ops.literal, "abc"]);
    assertParse("host", "abc:123", [ops.literal, "abc:123"]);
  });

  test("identifier", () => {
    assertParse("identifier", "foo", "foo", "jse", false);
    assertParse("identifier", "$Δelta", "$Δelta", "jse", false);
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
      [markers.reference, "fn"],
      [markers.reference, "arg"],
    ]);
    assertParse("implicitParenthesesCallExpression", "page.ori 'a', 'b'", [
      [markers.dots, [ops.literal, "page"], [ops.literal, "ori"]],
      [ops.literal, "a"],
      [ops.literal, "b"],
    ]);
    assertParse("implicitParenthesesCallExpression", "fn a(b), c", [
      [markers.reference, "fn"],
      [
        [markers.reference, "a"],
        [markers.reference, "b"],
      ],
      [markers.reference, "c"],
    ]);
    assertParse("implicitParenthesesCallExpression", "(fn()) 'arg'", [
      [[markers.reference, "fn"], undefined],
      [ops.literal, "arg"],
    ]);
    assertParse("implicitParenthesesCallExpression", "tree/key arg", [
      [markers.path, [ops.literal, "tree"], [ops.literal, "key"]],
      [markers.reference, "arg"],
    ]);
    assertParse("implicitParenthesesCallExpression", "foo.js bar.ori 'arg'", [
      [markers.dots, [ops.literal, "foo"], [ops.literal, "js"]],
      [
        [markers.dots, [ops.literal, "bar"], [ops.literal, "ori"]],
        [ops.literal, "arg"],
      ],
    ]);
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
      [markers.reference, "true"],
      [ops.lambda, [], [markers.reference, "false"]],
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
      [markers.reference, "false"],
      [ops.lambda, [], [markers.reference, "false"]],
      [ops.lambda, [], [markers.reference, "true"]],
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
      "jse",
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
      [markers.reference, "Foo"],
    ]);
    assertParse("newExpression", "new:Foo()", [
      ops.construct,
      [markers.reference, "Foo"],
    ]);
  });

  test("nullishCoalescingExpression", () => {
    assertParse("nullishCoalescingExpression", "a ?? b", [
      ops.nullishCoalescing,
      [markers.reference, "a"],
      [ops.lambda, [], [markers.reference, "b"]],
    ]);
    assertParse("nullishCoalescingExpression", "a ?? b ?? c", [
      ops.nullishCoalescing,
      [markers.reference, "a"],
      [ops.lambda, [], [markers.reference, "b"]],
      [ops.lambda, [], [markers.reference, "c"]],
    ]);
  });

  test("numericLiteral", () => {
    assertParse("numericLiteral", "123", [ops.literal, 123]);
    assertParse("numericLiteral", ".5", [ops.literal, 0.5]);
    assertParse("numericLiteral", "123.45", [ops.literal, 123.45]);
  });

  test("objectLiteral", () => {
    assertParse("objectLiteral", "{}", [ops.object]);
    assertParse("objectLiteral", "{ a: 1, b }", [
      ops.object,
      ["a", [ops.literal, 1]],
      ["b", [markers.reference, "b"]],
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
      ["a", [ops.getter, [markers.reference, "b"]]],
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
        ["a", [ops.getter, [markers.reference, "b"]]],
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
          ["b", [ops.getter, [[markers.reference, "fn"], undefined]]],
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
            [markers.dots, [ops.literal, "fn"], [ops.literal, "js"]],
            [ops.literal, "a"],
          ],
        ],
      ],
    ]);
    assertParse("objectLiteral", "{ a: 1, ...more, c: a }", [
      [
        ops.object,
        ["a", [ops.literal, 1]],
        ["c", [markers.reference, "a"]],
        [
          "_result",
          [
            ops.merge,
            [ops.object, ["a", [ops.getter, [[ops.context, 1], "a"]]]],
            [markers.reference, "more"],
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
    assertParse("objectLiteral", "{ (a): 1 }", [
      ops.object,
      ["(a)", [ops.literal, 1]],
    ]);
    assertParse(
      "objectLiteral",
      "{ <path/to/file.txt> }",
      [
        ops.object,
        [
          "file.txt",
          [
            [ops.scope],
            [ops.literal, "path/"],
            [ops.literal, "to/"],
            [ops.literal, "file.txt"],
          ],
        ],
      ],
      "jse"
    );
  });

  test("objectEntry", () => {
    assertParse("objectEntry", "foo", ["foo", [markers.reference, "foo"]]);
    assertParse("objectEntry", "index.html: x", [
      "index.html",
      [markers.reference, "x"],
    ]);
    assertParse("objectEntry", "a: a", ["a", [markers.reference, "a"]]);
    assertParse(
      "objectEntry",
      "<path/to/file.txt>",
      [
        "file.txt",
        [
          [ops.scope],
          [ops.literal, "path/"],
          [ops.literal, "to/"],
          [ops.literal, "file.txt"],
        ],
      ],
      "jse"
    );
    assertParse("objectEntry", "a: (a) => a", [
      "a",
      [ops.lambda, [[ops.literal, "a"]], [markers.reference, "a"]],
    ]);
    assertParse("objectEntry", "posts/: map(posts, post.ori)", [
      "posts/",
      [
        [markers.reference, "map"],
        [markers.reference, "posts"],
        [markers.dots, [ops.literal, "post"], [ops.literal, "ori"]],
      ],
    ]);
  });

  test("objectGetter", () => {
    assertParse("objectGetter", "data = obj.json", [
      "data",
      [ops.getter, [markers.dots, [ops.literal, "obj"], [ops.literal, "json"]]],
    ]);
    assertParse("objectGetter", "index.html = index.ori(teamData.yaml)", [
      "index.html",
      [
        ops.getter,
        [
          [markers.dots, [ops.literal, "index"], [ops.literal, "ori"]],
          [markers.dots, [ops.literal, "teamData"], [ops.literal, "yaml"]],
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
        [markers.reference, "fn"],
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
      [markers.reference, "a"],
      [markers.reference, "b"],
      [markers.reference, "c"],
    ]);
  });

  test("path", () => {
    assertParse("path", "/tree/", [[ops.literal, "tree/"]]);
    assertParse("path", "/month/12", [
      [ops.literal, "month/"],
      [ops.literal, "12"],
    ]);
    assertParse("path", "/tree/foo/bar", [
      [ops.literal, "tree/"],
      [ops.literal, "foo/"],
      [ops.literal, "bar"],
    ]);
    assertParse("path", "/a///b", [
      [ops.literal, "a/"],
      [ops.literal, "b"],
    ]);
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

  test("pipelineExpression", () => {
    assertParse("pipelineExpression", "foo", [markers.reference, "foo"]);
    assertParse("pipelineExpression", "a -> b", [
      [markers.reference, "b"],
      [markers.reference, "a"],
    ]);
    assertParse("pipelineExpression", "input → one.js → two.js", [
      [markers.dots, [ops.literal, "two"], [ops.literal, "js"]],
      [
        [markers.dots, [ops.literal, "one"], [ops.literal, "js"]],
        [markers.reference, "input"],
      ],
    ]);
    assertParse("pipelineExpression", "fn a -> b", [
      [markers.reference, "b"],
      [
        [markers.reference, "fn"],
        [markers.reference, "a"],
      ],
    ]);
  });

  test("primary", () => {
    assertParse("primary", "foo.js", [
      markers.dots,
      [ops.literal, "foo"],
      [ops.literal, "js"],
    ]);
    assertParse("primary", "[1, 2]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, 2],
    ]);
    assertParse("primary", "<index.html>", [
      [ops.scope],
      [ops.literal, "index.html"],
    ]);
  });

  test("program", () => {
    assertParse(
      "program",
      `#!/usr/bin/env ori invoke
'Hello'
`,
      [ops.literal, "Hello"],
      "jse",
      false
    );
  });

  test("protocol", () => {
    assertParse("protocol", "https:", [markers.global, "https:"]);
  });

  describe("protocolExpression", () => {
    test("protocol call", () => {
      assertParse("protocolExpression", "files:build", [
        [markers.global, "files:"],
        [ops.literal, "build"],
      ]);
    });

    test("URLs with protocols", () => {
      assertParse("protocolExpression", "foo://bar/baz", [
        [markers.global, "foo:"],
        [ops.literal, "bar/"],
        [ops.literal, "baz"],
      ]);
      assertParse("protocolExpression", "http://example.com", [
        [markers.global, "http:"],
        [ops.literal, "example.com"],
      ]);
      assertParse("protocolExpression", "https://example.com/about/", [
        [markers.global, "https:"],
        [ops.literal, "example.com/"],
        [ops.literal, "about/"],
      ]);
      assertParse(
        "protocolExpression",
        "https://example.com/about/index.html",
        [
          [markers.global, "https:"],
          [ops.literal, "example.com/"],
          [ops.literal, "about/"],
          [ops.literal, "index.html"],
        ]
      );
      assertParse("protocolExpression", "http://localhost:5000/foo", [
        [markers.global, "http:"],
        [ops.literal, "localhost:5000/"],
        [ops.literal, "foo"],
      ]);
      assertParse("protocolExpression", "files:///foo/bar.txt", [
        [markers.global, "files:"],
        [ops.literal, "/"],
        [ops.literal, "foo/"],
        [ops.literal, "bar.txt"],
      ]);
    });
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
      [markers.reference, "message"],
    ]);
    assertParse("shorthandFunction", "=`Hello, ${name}.`", [
      ops.lambda,
      [[ops.literal, "_"]],
      [
        ops.templateTree,
        [ops.literal, ["Hello, ", "."]],
        [markers.reference, "name"],
      ],
    ]);
    assertParse("shorthandFunction", "=indent`hello`", [
      ops.lambda,
      [[ops.literal, "_"]],
      [
        [markers.reference, "indent"],
        [ops.literal, ["hello"]],
      ],
    ]);
  });

  test("singleLineComment", () => {
    assertParse("singleLineComment", "// Hello, world!", null, "jse", false);
  });

  test("slashChain", () => {
    assertParse("slashChain", "foo", [markers.reference, "foo"]);
    assertParse("slashChain", "index.html", [
      markers.dots,
      [ops.literal, "index"],
      [ops.literal, "html"],
    ]);
    assertParse("slashChain", "package.json/name", [
      markers.path,
      [markers.dots, [ops.literal, "package"], [ops.literal, "json"]],
      [ops.literal, "name"],
    ]);
    // Trailing slash is an unpack
    assertParse("slashChain", "a.b/x.y/", [
      [ops.scope],
      [ops.literal, "a.b/"],
      [ops.literal, "x.y/"],
    ]);
  });

  test("spreadElement", () => {
    assertParse("spreadElement", "...a", [
      ops.spread,
      [markers.reference, "a"],
    ]);
    assertParse("spreadElement", "…a", [ops.spread, [markers.reference, "a"]]);
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
      [markers.reference, "foo"],
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
        ["@text", [ops.templateIndent, [ops.literal, ["Body text"]]]],
      ]
    );
  });

  test("templateDocument with Origami front matter", () => {
    assertParse(
      "templateDocument",
      `---
{
  title: "Title"
  @text: @template()
}
---
<h1>\${ title }</h1>
`,
      [
        ops.object,
        ["title", [ops.literal, "Title"]],
        [
          "@text",
          [
            ops.templateIndent,
            [ops.literal, ["<h1>", "</h1>\n"]],
            [markers.reference, "title"],
          ],
        ],
      ],
      "shell"
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
            [markers.reference, "title"],
          ],
        ],
      ],
      "jse"
    );
  });

  test("templateLiteral", () => {
    assertParse("templateLiteral", "`Hello, world.`", [
      ops.templateTree,
      [ops.literal, ["Hello, world."]],
    ]);
    assertParse(
      "templateLiteral",
      "`Hello, world.`",
      [ops.templateTree, [ops.literal, ["Hello, world."]]],
      "jse"
    );
    assertParse("templateLiteral", "`foo ${x} bar`", [
      ops.templateTree,
      [ops.literal, ["foo ", " bar"]],
      [markers.reference, "x"],
    ]);
    assertParse("templateLiteral", "`${`nested`}`", [
      ops.templateTree,
      [ops.literal, ["", ""]],
      [ops.templateTree, [ops.literal, ["nested"]]],
    ]);
    assertParse("templateLiteral", "`${ map(people, =`${name}`) }`", [
      ops.templateTree,
      [ops.literal, ["", ""]],
      [
        [markers.reference, "map"],
        [markers.reference, "people"],
        [
          ops.lambda,
          [[ops.literal, "_"]],
          [
            ops.templateTree,
            [ops.literal, ["", ""]],
            [markers.reference, "name"],
          ],
        ],
      ],
    ]);
  });

  test("templateSubtitution", () => {
    assertParse(
      "templateSubstitution",
      "${foo}",
      [markers.reference, "foo"],
      "shell",
      false
    );
  });

  test("whitespace block", () => {
    assertParse(
      "__",
      `  
  // First comment
  // Second comment
     `,
      null,
      "jse",
      false
    );
  });

  test("unaryExpression", () => {
    assertParse("unaryExpression", "!true", [
      ops.logicalNot,
      [markers.reference, "true"],
    ]);
    assertParse("unaryExpression", "+1", [ops.unaryPlus, [ops.literal, 1]]);
    assertParse("unaryExpression", "-2", [ops.unaryMinus, [ops.literal, 2]]);
    assertParse("unaryExpression", "~3", [ops.bitwiseNot, [ops.literal, 3]]);
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
  if (checkLocation) {
    assertCodeLocations(code);
    const resultSource = code.location.source.text.slice(
      code.location.start.offset,
      code.location.end.offset
    );
    assert.equal(resultSource, source);
  }

  assertCodeEqual(code, expected);
}

function assertCodeLocations(code) {
  assert(code.location, "no location");
  for (const item of code) {
    if (Array.isArray(item)) {
      assertCodeLocations(item);
    }
  }
}

function assertThrows(startRule, source, message, position, mode = "shell") {
  try {
    parse(source, {
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
