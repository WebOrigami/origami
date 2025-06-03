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
      assertParse(
        "angleBracketLiteral",
        "<index.html>",
        [[ops.scope], [ops.literal, "index.html"]],
        "jse"
      );
      assertParse(
        "angleBracketLiteral",
        "<foo/bar/baz>",
        [
          [ops.scope],
          [ops.literal, "foo/"],
          [ops.literal, "bar/"],
          [ops.literal, "baz"],
        ],
        "jse"
      );
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
      [markers.reference, [ops.literal, "foo"]],
    ]);
    assertParse("arrowFunction", "x => y", [
      ops.lambda,
      [[ops.literal, "x"]],
      [markers.reference, [ops.literal, "y"]],
    ]);
    assertParse("arrowFunction", "(a, b, c) ⇒ fn(a, b, c)", [
      ops.lambda,
      [
        [ops.literal, "a"],
        [ops.literal, "b"],
        [ops.literal, "c"],
      ],
      [
        [markers.global, "fn"],
        [markers.reference, [ops.literal, "a"]],
        [markers.reference, [ops.literal, "b"]],
        [markers.reference, [ops.literal, "c"]],
      ],
    ]);
    assertParse("arrowFunction", "a => b => fn(a, b)", [
      ops.lambda,
      [[ops.literal, "a"]],
      [
        ops.lambda,
        [[ops.literal, "b"]],
        [
          [markers.global, "fn"],
          [markers.reference, [ops.literal, "a"]],
          [markers.reference, [ops.literal, "b"]],
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
        [markers.global, "fn"],
        undefined,
      ]);
      assertParse("callExpression", "foo.js(arg)", [
        [markers.reference, [ops.literal, "foo.js"]],
        [markers.reference, [ops.literal, "arg"]],
      ]);
      assertParse("callExpression", "fn(a, b)", [
        [markers.global, "fn"],
        [markers.reference, [ops.literal, "a"]],
        [markers.reference, [ops.literal, "b"]],
      ]);
      assertParse("callExpression", "foo.js( a , b )", [
        [markers.reference, [ops.literal, "foo.js"]],
        [markers.reference, [ops.literal, "a"]],
        [markers.reference, [ops.literal, "b"]],
      ]);
      assertParse("callExpression", "fn()(arg)", [
        [[markers.global, "fn"], undefined],
        [markers.reference, [ops.literal, "arg"]],
      ]);
    });
    test("call chains", () => {
      assertParse("callExpression", "(foo.js())('arg')", [
        [[markers.reference, [ops.literal, "foo.js"]], undefined],
        [ops.literal, "arg"],
      ]);
      assertParse("callExpression", "fn('a')('b')", [
        [
          [markers.global, "fn"],
          [ops.literal, "a"],
        ],
        [ops.literal, "b"],
      ]);
      assertParse("callExpression", "(foo.js())(a, b)", [
        [[markers.reference, [ops.literal, "foo.js"]], undefined],
        [markers.reference, [ops.literal, "a"]],
        [markers.reference, [ops.literal, "b"]],
      ]);
    });
    test("with paths", () => {
      assertParse("callExpression", "/", [ops.rootDirectory]);
      assertParse("callExpression", "tree/", [
        ops.unpack,
        [markers.reference, [ops.literal, "tree/"]],
      ]);
      assertParse("callExpression", "tree/foo/bar", [
        markers.reference,
        [ops.literal, "tree/"],
        [ops.literal, "foo/"],
        [ops.literal, "bar"],
      ]);
      assertParse("callExpression", "tree/foo/bar/", [
        markers.reference,
        [ops.literal, "tree/"],
        [ops.literal, "foo/"],
        [ops.literal, "bar/"],
      ]);
      // Consecutive slahes in a path are removed
      assertParse("callExpression", "path//key", [
        markers.reference,
        [ops.literal, "path/"],
        [ops.literal, "key"],
      ]);
      assertParse("callExpression", "/foo/bar", [
        [ops.rootDirectory],
        [ops.literal, "foo/"],
        [ops.literal, "bar"],
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
        [[markers.reference, [ops.literal, "foo.js"]], undefined],
        [ops.literal, "key"],
      ]);
      assertParse("callExpression", "tree/key()", [
        [markers.reference, [ops.literal, "tree/"], [ops.literal, "key"]],
        undefined,
      ]);
      assertParse("callExpression", "(tree)/", [
        ops.unpack,
        [markers.reference, [ops.literal, "tree/"]],
      ]);
      assertParse("callExpression", "fn()/key()", [
        [
          [[markers.global, "fn"], undefined],
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
        [markers.reference, [ops.literal, "creds"]],
      ]);
    });
    test("tagged templates", () => {
      assertParse("callExpression", "indent`hello`", [
        [markers.global, "indent"],
        [ops.literal, ["hello"]],
      ]);
      assertParse("callExpression", "fn.js`Hello, world.`", [
        [markers.reference, [ops.literal, "fn.js"]],
        [ops.literal, ["Hello, world."]],
      ]);
    });
    test("protocols", () => {
      assertParse("callExpression", "files:src/assets", [
        [markers.global, "files:"],
        [ops.literal, "src/"],
        [ops.literal, "assets"],
      ]);
      assertParse("callExpression", "new:(js:Date, '2025-01-01')", [
        [markers.global, "new:"],
        [
          [markers.global, "js:"],
          [ops.literal, "Date"],
        ],
        [ops.literal, "2025-01-01"],
      ]);
    });
  });

  test("callExpression using property acccess", () => {
    assertParse("callExpression", "(foo).bar", [
      markers.reference,
      [ops.literal, "foo/"],
      [ops.literal, "bar"],
    ]);
    assertParse("callExpression", "(foo).bar.baz", [
      markers.reference,
      [ops.literal, "foo/"],
      [ops.literal, "bar/"],
      [ops.literal, "baz"],
    ]);
    assertParse("callExpression", "foo[bar]", [
      markers.reference,
      [ops.literal, "foo/"],
      [markers.reference, [ops.literal, "bar"]],
    ]);
    assertParse(
      "callExpression",
      "Tree.map",
      [markers.reference, [ops.literal, "Tree/"], [ops.literal, "map"]],
      "jse"
    );
  });

  test("commaExpression", () => {
    assertParse("commaExpression", "1", [ops.literal, 1]);
    assertParse("commaExpression", "a, b, c", [
      ops.comma,
      [markers.reference, [ops.literal, "a"]],
      [markers.reference, [ops.literal, "b"]],
      [markers.reference, [ops.literal, "c"]],
    ]);
  });

  test("conditionalExpression", () => {
    assertParse("conditionalExpression", "1", [ops.literal, 1]);
    assertParse("conditionalExpression", "true ? 1 : 0", [
      ops.conditional,
      [markers.reference, [ops.literal, "true"]],
      [ops.literal, 1],
      [ops.literal, 0],
    ]);
    assertParse("conditionalExpression", "false ? () => 1 : 0", [
      ops.conditional,
      [markers.reference, [ops.literal, "false"]],
      [ops.lambda, [], [ops.lambda, [], [ops.literal, 1]]],
      [ops.literal, 0],
    ]);
    assertParse("conditionalExpression", "false ? =1 : 0", [
      ops.conditional,
      [markers.reference, [ops.literal, "false"]],
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
        [markers.reference, [ops.literal, "a"]],
        [markers.reference, [ops.literal, "b"]],
      ],
      [markers.reference, [ops.literal, "c"]],
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
              [markers.reference, [ops.literal, "index.ori"]],
              [markers.reference, [ops.literal, "teamData.yaml"]],
            ],
          ],
        ],
        [
          "thumbnails",
          [
            ops.getter,
            [
              [markers.global, "map"],
              [markers.reference, [ops.literal, "images"]],
              [
                ops.object,
                ["value", [markers.reference, [ops.literal, "thumbnail.js"]]],
              ],
            ],
          ],
        ],
      ]
    );

    // Builtin on its own is the function itself, not a function call
    assertParse("expression", "mdHtml:", [markers.global, "mdHtml:"]);

    // Consecutive slashes at start of something = comment
    assertParse(
      "expression",
      "x //comment",
      [markers.reference, [ops.literal, "x"]],
      "jse",
      false
    );

    assertParse("expression", "page.ori(mdHtml:(about.md))", [
      [markers.reference, [ops.literal, "page.ori"]],
      [
        [markers.global, "mdHtml:"],
        [markers.reference, [ops.literal, "about.md"]],
      ],
    ]);

    // Slash on its own is the root folder
    assertParse("expression", "keys /", [
      [markers.global, "keys"],
      [ops.rootDirectory],
    ]);

    assertParse("expression", "'Hello' -> test.orit", [
      [markers.reference, [ops.literal, "test.orit"]],
      [ops.literal, "Hello"],
    ]);
    assertParse("expression", "obj.json", [
      markers.reference,
      [ops.literal, "obj.json"],
    ]);
    assertParse("expression", "(fn a, b, c)", [
      [markers.global, "fn"],
      [markers.reference, [ops.literal, "a"]],
      [markers.reference, [ops.literal, "b"]],
      [markers.reference, [ops.literal, "c"]],
    ]);
    assertParse("expression", "foo.bar('hello', 'world')", [
      [markers.reference, [ops.literal, "foo.bar"]],
      [ops.literal, "hello"],
      [ops.literal, "world"],
    ]);
    // assertParse("expression", "(key)('a')", [
    //   [markers.reference, [ops.literal, "key"]],
    //   [ops.literal, "a"],
    // ]);
    assertParse("expression", "1", [ops.literal, 1]);
    assertParse("expression", "{ a: 1, b: 2 }", [
      ops.object,
      ["a", [ops.literal, 1]],
      ["b", [ops.literal, 2]],
    ]);
    assertParse("expression", "serve { index.html: 'hello' }", [
      [markers.global, "serve"],
      [ops.object, ["index.html", [ops.literal, "hello"]]],
    ]);
    assertParse("expression", "fn =`x`", [
      [markers.global, "fn"],
      [
        ops.lambda,
        [[ops.literal, "_"]],
        [ops.templateTree, [ops.literal, ["x"]]],
      ],
    ]);
    assertParse("expression", "copy app.js(formulas), files:snapshot", [
      [markers.global, "copy"],
      [
        [markers.reference, [ops.literal, "app.js"]],
        [markers.reference, [ops.literal, "formulas"]],
      ],
      [
        [markers.global, "files:"],
        [ops.literal, "snapshot"],
      ],
    ]);
    assertParse("expression", "map =`<li>${_}</li>`", [
      [markers.global, "map"],
      [
        ops.lambda,
        [[ops.literal, "_"]],
        [
          ops.templateTree,
          [ops.literal, ["<li>", "</li>"]],
          [markers.reference, [ops.literal, "_"]],
        ],
      ],
    ]);
    assertParse("expression", `https://example.com/about/`, [
      [markers.global, "https:"],
      [ops.literal, "example.com/"],
      [ops.literal, "about/"],
    ]);
    assertParse("expression", "tag`Hello, ${name}!`", [
      [markers.global, "tag"],
      [ops.literal, ["Hello, ", "!"]],
      [ops.concat, [markers.reference, [ops.literal, "name"]]],
    ]);
    assertParse("expression", "(post, slug) => fn.js(post, slug)", [
      ops.lambda,
      [
        [ops.literal, "post"],
        [ops.literal, "slug"],
      ],
      [
        [markers.reference, [ops.literal, "fn.js"]],
        [markers.reference, [ops.literal, "post"]],
        [markers.reference, [ops.literal, "slug"]],
      ],
    ]);
    assertParse("expression", "keys ~", [
      [markers.global, "keys"],
      [ops.homeDirectory],
    ]);
    assertParse("expression", "keys /Users/alice", [
      [markers.global, "keys"],
      [[ops.rootDirectory], [ops.literal, "Users/"], [ops.literal, "alice"]],
    ]);

    // Verify parser treatment of identifiers containing operators
    assertParse("expression", "a + b", [
      ops.addition,
      [markers.reference, [ops.literal, "a"]],
      [markers.reference, [ops.literal, "b"]],
    ]);
    assertParse("expression", "a+b", [markers.reference, [ops.literal, "a+b"]]);
    assertParse("expression", "a - b", [
      ops.subtraction,
      [markers.reference, [ops.literal, "a"]],
      [markers.reference, [ops.literal, "b"]],
    ]);
    assertParse("expression", "a-b", [markers.reference, [ops.literal, "a-b"]]);
    assertParse("expression", "a&b", [markers.reference, [ops.literal, "a&b"]]);
    assertParse("expression", "a & b", [
      ops.bitwiseAnd,
      [markers.reference, [ops.literal, "a"]],
      [markers.reference, [ops.literal, "b"]],
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
        [[markers.reference, [ops.literal, "_template"]], undefined],
      ],
      "jse",
      false
    );
  });

  test("group", () => {
    assertParse("group", "(hello)", [
      markers.reference,
      [ops.literal, "hello"],
    ]);
    assertParse("group", "(((nested)))", [
      markers.reference,
      [ops.literal, "nested"],
    ]);
    assertParse("group", "(fn())", [[markers.global, "fn"], undefined]);
    assertParse("group", "(a -> b)", [
      [markers.global, "b"],
      [markers.reference, [ops.literal, "a"]],
    ]);
  });

  test("homeDirectory", () => {
    assertParse("homeDirectory", "~", [ops.homeDirectory]);
  });

  test("host", () => {
    assertParse("host", "abc", [ops.literal, "abc"]);
    assertParse("host", "abc:123", [ops.literal, "abc:123"]);
    assertParse("host", "foo\\ bar", [ops.literal, "foo bar"]);
  });

  test("identifier", () => {
    assertParse("identifier", "abc", "abc", "shell", false);
    assertParse("identifier", "index.html", "index.html", "shell", false);
    assertParse("identifier", "foo\\ bar", "foo bar", "shell", false);
    assertParse("identifier", "x-y-z", "x-y-z", "shell", false);
  });

  test("implicitParenthesesCallExpression", () => {
    assertParse("implicitParenthesesCallExpression", "fn arg", [
      [markers.global, "fn"],
      [markers.reference, [ops.literal, "arg"]],
    ]);
    assertParse("implicitParenthesesCallExpression", "page.ori 'a', 'b'", [
      [markers.reference, [ops.literal, "page.ori"]],
      [ops.literal, "a"],
      [ops.literal, "b"],
    ]);
    assertParse("implicitParenthesesCallExpression", "fn a(b), c", [
      [markers.global, "fn"],
      [
        [markers.global, "a"],
        [markers.reference, [ops.literal, "b"]],
      ],
      [markers.reference, [ops.literal, "c"]],
    ]);
    assertParse("implicitParenthesesCallExpression", "(fn()) 'arg'", [
      [[markers.global, "fn"], undefined],
      [ops.literal, "arg"],
    ]);
    assertParse("implicitParenthesesCallExpression", "tree/key arg", [
      [markers.reference, [ops.literal, "tree/"], [ops.literal, "key"]],
      [markers.reference, [ops.literal, "arg"]],
    ]);
    assertParse("implicitParenthesesCallExpression", "foo.js bar.ori 'arg'", [
      [markers.reference, [ops.literal, "foo.js"]],
      [
        [markers.reference, [ops.literal, "bar.ori"]],
        [ops.literal, "arg"],
      ],
    ]);
  });

  test("jsIdentifier", () => {
    assertParse("jsIdentifier", "foo", [ops.literal, "foo"], "jse");
    assertParse("jsIdentifier", "$Δelta", [ops.literal, "$Δelta"], "jse");
    assertThrows(
      "jsIdentifier",
      "1stCharacterIsNumber",
      "Expected JavaScript identifier start"
    );
    assertThrows(
      "jsIdentifier",
      "has space",
      "Expected JavaScript identifier continuation"
    );
    assertThrows(
      "jsIdentifier",
      "foo.bar",
      "Expected JavaScript identifier continuation"
    );
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
      [markers.reference, [ops.literal, "true"]],
      [ops.lambda, [], [markers.reference, [ops.literal, "false"]]],
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
      [markers.reference, [ops.literal, "false"]],
      [ops.lambda, [], [markers.reference, [ops.literal, "false"]]],
      [ops.lambda, [], [markers.reference, [ops.literal, "true"]]],
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

  test("namespace", () => {
    assertParse("namespace", "js:", [markers.global, "js:"]);
  });

  test("newExpression", () => {
    assertParse("newExpression", "new Foo()", [
      ops.construct,
      [markers.reference, [ops.literal, "Foo"]],
    ]);
    assertParse("newExpression", "new:Foo()", [
      ops.construct,
      [markers.reference, [ops.literal, "Foo"]],
    ]);
  });

  test("nullishCoalescingExpression", () => {
    assertParse("nullishCoalescingExpression", "a ?? b", [
      ops.nullishCoalescing,
      [markers.reference, [ops.literal, "a"]],
      [ops.lambda, [], [markers.reference, [ops.literal, "b"]]],
    ]);
    assertParse("nullishCoalescingExpression", "a ?? b ?? c", [
      ops.nullishCoalescing,
      [markers.reference, [ops.literal, "a"]],
      [ops.lambda, [], [markers.reference, [ops.literal, "b"]]],
      [ops.lambda, [], [markers.reference, [ops.literal, "c"]]],
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
      ["a", [ops.getter, [markers.reference, [ops.literal, "b"]]]],
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
        ["a", [ops.getter, [markers.reference, [ops.literal, "b"]]]],
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
        [ops.object, ["b", [ops.getter, [[markers.global, "fn"], undefined]]]],
      ],
    ]);
    assertParse("objectLiteral", "{ x = fn.js('a') }", [
      ops.object,
      [
        "x",
        [
          ops.getter,
          [
            [markers.reference, [ops.literal, "fn.js"]],
            [ops.literal, "a"],
          ],
        ],
      ],
    ]);
    assertParse("objectLiteral", "{ a: 1, ...more, c: a }", [
      [
        ops.object,
        ["a", [ops.literal, 1]],
        ["c", [markers.reference, [ops.literal, "a"]]],
        [
          "_result",
          [
            ops.merge,
            [ops.object, ["a", [ops.getter, [[ops.context, 1], "a"]]]],
            [markers.reference, [ops.literal, "more"]],
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
    assertParse("objectEntry", "x: y", [
      "x",
      [markers.reference, [ops.literal, "y"]],
    ]);
    assertParse("objectEntry", "a: a", [
      "a",
      [markers.reference, [ops.literal, "a"]],
    ]);
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
      [
        ops.lambda,
        [[ops.literal, "a"]],
        [markers.reference, [ops.literal, "a"]],
      ],
    ]);
    assertParse("objectEntry", "posts/: map(posts, post.ori)", [
      "posts/",
      [
        [markers.global, "map"],
        [markers.reference, [ops.literal, "posts"]],
        [markers.reference, [ops.literal, "post.ori"]],
      ],
    ]);
  });

  test("objectGetter", () => {
    assertParse("objectGetter", "data = obj.json", [
      "data",
      [ops.getter, [markers.reference, [ops.literal, "obj.json"]]],
    ]);
    assertParse("objectGetter", "foo = page.ori 'bar'", [
      "foo",
      [
        ops.getter,
        [
          [markers.reference, [ops.literal, "page.ori"]],
          [ops.literal, "bar"],
        ],
      ],
    ]);
  });

  test("objectProperty", () => {
    assertParse("objectProperty", "a: 1", ["a", [ops.literal, 1]]);
    assertParse("objectProperty", "name: 'Alice'", [
      "name",
      [ops.literal, "Alice"],
    ]);
    assertParse("objectProperty", "x: fn('a')", [
      "x",
      [
        [markers.global, "fn"],
        [ops.literal, "a"],
      ],
    ]);
  });

  test("objectPublicKey", () => {
    assertParse("objectPublicKey", "a", "a", "jse", false);
    assertParse("objectPublicKey", "markdown/", "markdown/", "jse", false);
    assertParse("objectPublicKey", "foo\\ bar", "foo bar", "jse", false);
  });

  test("optionalChaining", () => {
    assertParse("optionalChaining", "?.key", [
      ops.optionalTraverse,
      [ops.literal, "key"],
    ]);
  });

  test("parenthesesArguments", () => {
    assertParse("parenthesesArguments", "()", [undefined]);
    assertParse("parenthesesArguments", "(a, b, c)", [
      [markers.reference, [ops.literal, "a"]],
      [markers.reference, [ops.literal, "b"]],
      [markers.reference, [ops.literal, "c"]],
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
    assertParse("pipelineExpression", "foo", [
      markers.reference,
      [ops.literal, "foo"],
    ]);
    assertParse("pipelineExpression", "a -> b", [
      [markers.global, "b"],
      [markers.reference, [ops.literal, "a"]],
    ]);
    assertParse("pipelineExpression", "input → one.js → two.js", [
      [markers.reference, [ops.literal, "two.js"]],
      [
        [markers.reference, [ops.literal, "one.js"]],
        [markers.reference, [ops.literal, "input"]],
      ],
    ]);
    assertParse("pipelineExpression", "fn a -> b", [
      [markers.global, "b"],
      [
        [markers.global, "fn"],
        [markers.reference, [ops.literal, "a"]],
      ],
    ]);
  });

  test("primary", () => {
    assertParse("primary", "foo.js", [
      markers.reference,
      [ops.literal, "foo.js"],
    ]);
    assertParse("primary", "[1, 2]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, 2],
    ]);
    // Only in JSE
    assertParse(
      "primary",
      "<index.html>",
      [[ops.scope], [ops.literal, "index.html"]],
      "jse",
      false
    );
    assertThrows("primary", "<index.html>", `but "<" found`, 0, "shell");
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

  test("protocolExpression", () => {
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
    assertParse("protocolExpression", "https://example.com/about/index.html", [
      [markers.global, "https:"],
      [ops.literal, "example.com/"],
      [ops.literal, "about/"],
      [ops.literal, "index.html"],
    ]);
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

  test("qualifiedReference", () => {
    assertParse("qualifiedReference", "js:Date", [
      [markers.global, "js:"],
      [ops.literal, "Date"],
    ]);
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

  test("scopeReference", () => {
    assertParse("scopeReference", "keys", [
      markers.reference,
      [ops.literal, "keys"],
    ]);
    assertParse("scopeReference", "greet.js", [
      markers.reference,
      [ops.literal, "greet.js"],
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
      [markers.reference, [ops.literal, "message"]],
    ]);
    assertParse("shorthandFunction", "=`Hello, ${name}.`", [
      ops.lambda,
      [[ops.literal, "_"]],
      [
        ops.templateTree,
        [ops.literal, ["Hello, ", "."]],
        [markers.reference, [ops.literal, "name"]],
      ],
    ]);
    assertParse("shorthandFunction", "=indent`hello`", [
      ops.lambda,
      [[ops.literal, "_"]],
      [
        [markers.global, "indent"],
        [ops.literal, ["hello"]],
      ],
    ]);
  });

  test("singleLineComment", () => {
    assertParse("singleLineComment", "// Hello, world!", null, "jse", false);
  });

  test("spreadElement", () => {
    assertParse("spreadElement", "...a", [
      ops.spread,
      [markers.reference, [ops.literal, "a"]],
    ]);
    assertParse("spreadElement", "…a", [
      ops.spread,
      [markers.reference, [ops.literal, "a"]],
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
      [markers.reference, [ops.literal, "foo"]],
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
            [markers.reference, [ops.literal, "title"]],
          ],
        ],
      ]
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
      [ops.templateStandard, [ops.literal, ["Hello, world."]]],
      "jse"
    );
    assertParse("templateLiteral", "`foo ${x} bar`", [
      ops.templateTree,
      [ops.literal, ["foo ", " bar"]],
      [markers.reference, [ops.literal, "x"]],
    ]);
    assertParse("templateLiteral", "`${`nested`}`", [
      ops.templateTree,
      [ops.literal, ["", ""]],
      [ops.templateTree, [ops.literal, ["nested"]]],
    ]);
    assertParse("templateLiteral", "`${ map:(people, =`${name}`) }`", [
      ops.templateTree,
      [ops.literal, ["", ""]],
      [
        [markers.global, "map:"],
        [markers.reference, [ops.literal, "people"]],
        [
          ops.lambda,
          [[ops.literal, "_"]],
          [
            ops.templateTree,
            [ops.literal, ["", ""]],
            [markers.reference, [ops.literal, "name"]],
          ],
        ],
      ],
    ]);
  });

  test("templateSubtitution", () => {
    assertParse(
      "templateSubstitution",
      "${foo}",
      [markers.reference, [ops.literal, "foo"]],
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
      [markers.reference, [ops.literal, "true"]],
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
