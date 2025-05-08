import assert from "node:assert";
import { describe, test } from "node:test";
import { parse } from "../../src/compiler/parse.js";
import { undetermined } from "../../src/compiler/parserHelpers.js";
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

  test("angleBracketLiteral", () => {
    assertParse(
      "angleBracketLiteral",
      "<index.html>",
      [ops.scope, "index.html"],
      "jse",
      false
    );
    assertParse(
      "angleBracketLiteral",
      "<foo/bar/baz>",
      [
        ops.traverse,
        [ops.scope, "foo/"],
        [ops.literal, "bar/"],
        [ops.literal, "baz"],
      ],
      "jse",
      false
    );
    assertParse("angleBracketLiteral", "<files:src/assets>", [
      ops.traverse,
      [
        [ops.builtin, "files:"],
        [ops.literal, "src/"],
      ],
      [ops.literal, "assets"],
    ]);
    assertParse(
      "angleBracketLiteral",
      "<https://example.com/>",
      [
        [ops.builtin, "https:"],
        [ops.literal, "example.com/"],
      ],
      "jse",
      false
    );
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
      ops.merge,
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
      [ops.scope, "foo"],
    ]);
    assertParse("arrowFunction", "x => y", [
      ops.lambda,
      [[ops.literal, "x"]],
      [ops.scope, "y"],
    ]);
    assertParse("arrowFunction", "(a, b, c) ⇒ fn(a, b, c)", [
      ops.lambda,
      [
        [ops.literal, "a"],
        [ops.literal, "b"],
        [ops.literal, "c"],
      ],
      [
        [ops.builtin, "fn"],
        [ops.scope, "a"],
        [ops.scope, "b"],
        [ops.scope, "c"],
      ],
    ]);
    assertParse("arrowFunction", "a => b => fn(a, b)", [
      ops.lambda,
      [[ops.literal, "a"]],
      [
        ops.lambda,
        [[ops.literal, "b"]],
        [
          [ops.builtin, "fn"],
          [ops.scope, "a"],
          [ops.scope, "b"],
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

  test("callExpression", () => {
    assertParse("callExpression", "fn()", [[ops.builtin, "fn"], undefined]);
    assertParse("callExpression", "foo.js(arg)", [
      [ops.scope, "foo.js"],
      [ops.scope, "arg"],
    ]);
    assertParse("callExpression", "fn(a, b)", [
      [ops.builtin, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("callExpression", "foo.js( a , b )", [
      [ops.scope, "foo.js"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("callExpression", "fn()(arg)", [
      [[ops.builtin, "fn"], undefined],
      [ops.scope, "arg"],
    ]);
    assertParse("callExpression", "tree/", [ops.unpack, [ops.scope, "tree/"]]);
    assertParse("callExpression", "tree/foo/bar", [
      ops.traverse,
      [ops.scope, "tree/"],
      [ops.literal, "foo/"],
      [ops.literal, "bar"],
    ]);
    assertParse("callExpression", "tree/foo/bar/", [
      ops.traverse,
      [ops.scope, "tree/"],
      [ops.literal, "foo/"],
      [ops.literal, "bar/"],
    ]);
    assertParse("callExpression", "/foo/bar", [
      ops.traverse,
      [ops.rootDirectory, [ops.literal, "foo/"]],
      [ops.literal, "bar"],
    ]);
    assertParse("callExpression", "foo.js()/key", [
      ops.traverse,
      [[ops.scope, "foo.js"], undefined],
      [ops.literal, "key"],
    ]);
    assertParse("callExpression", "tree/key()", [
      [ops.traverse, [ops.scope, "tree/"], [ops.literal, "key"]],
      undefined,
    ]);
    assertParse("callExpression", "(tree)/", [ops.unpack, [ops.scope, "tree"]]);
    assertParse("callExpression", "fn()/key()", [
      [ops.traverse, [[ops.builtin, "fn"], undefined], [ops.literal, "key"]],
      undefined,
    ]);
    assertParse("callExpression", "(foo.js())('arg')", [
      [[ops.scope, "foo.js"], undefined],
      [ops.literal, "arg"],
    ]);
    assertParse("callExpression", "fn('a')('b')", [
      [
        [ops.builtin, "fn"],
        [ops.literal, "a"],
      ],
      [ops.literal, "b"],
    ]);
    assertParse("callExpression", "(foo.js())(a, b)", [
      [[ops.scope, "foo.js"], undefined],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("callExpression", "{ a: 1, b: 2}/b", [
      ops.traverse,
      [ops.object, ["a", [ops.literal, 1]], ["b", [ops.literal, 2]]],
      [ops.literal, "b"],
    ]);
    assertParse("callExpression", "indent`hello`", [
      [ops.builtin, "indent"],
      [ops.literal, ["hello"]],
    ]);
    assertParse("callExpression", "fn.js`Hello, world.`", [
      [ops.scope, "fn.js"],
      [ops.literal, ["Hello, world."]],
    ]);
    assertParse("callExpression", "files:src/assets", [
      ops.traverse,
      [
        [ops.builtin, "files:"],
        [ops.literal, "src/"],
      ],
      [ops.literal, "assets"],
    ]);
    assertParse("callExpression", "new:(js:Date, '2025-01-01')", [
      [ops.builtin, "new:"],
      [
        [ops.builtin, "js:"],
        [ops.literal, "Date"],
      ],
      [ops.literal, "2025-01-01"],
    ]);
    assertParse("callExpression", "map(markdown, mdHtml)", [
      [ops.builtin, "map"],
      [ops.scope, "markdown"],
      [ops.scope, "mdHtml"],
    ]);
    assertParse("callExpression", "package:@weborigami/dropbox/auth(creds)", [
      [
        ops.traverse,
        [
          [ops.builtin, "package:"],
          [ops.literal, "@weborigami/"],
        ],
        [ops.literal, "dropbox/"],
        [ops.literal, "auth"],
      ],
      [ops.scope, "creds"],
    ]);
  });

  test("callExpression using property acccess", () => {
    assertParse("callExpression", "(foo).bar", [
      ops.traverse,
      [ops.scope, "foo"],
      [ops.literal, "bar"],
    ]);
    assertParse("callExpression", "(foo).bar.baz", [
      ops.traverse,
      [ops.traverse, [ops.scope, "foo"], [ops.literal, "bar"]],
      [ops.literal, "baz"],
    ]);
    assertParse("callExpression", "foo[bar]", [
      ops.traverse,
      [ops.scope, "foo/"],
      [ops.scope, "bar"],
    ]);
  });

  test("commaExpression", () => {
    assertParse("commaExpression", "1", [ops.literal, 1]);
    assertParse("commaExpression", "a, b, c", [
      ops.comma,
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
  });

  test("conditionalExpression", () => {
    assertParse("conditionalExpression", "1", [ops.literal, 1]);
    assertParse("conditionalExpression", "true ? 1 : 0", [
      ops.conditional,
      [ops.scope, "true"],
      [ops.literal, 1],
      [ops.literal, 0],
    ]);
    assertParse("conditionalExpression", "false ? () => 1 : 0", [
      ops.conditional,
      [ops.scope, "false"],
      [ops.lambda, [], [ops.lambda, [], [ops.literal, 1]]],
      [ops.literal, 0],
    ]);
    assertParse("conditionalExpression", "false ? =1 : 0", [
      ops.conditional,
      [ops.scope, "false"],
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
      [ops.strictEqual, [undetermined, "a"], [undetermined, "b"]],
      [undetermined, "c"],
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
              [ops.scope, "index.ori"],
              [ops.scope, "teamData.yaml"],
            ],
          ],
        ],
        [
          "thumbnails",
          [
            ops.getter,
            [
              [ops.builtin, "map"],
              [ops.scope, "images"],
              [ops.object, ["value", [ops.scope, "thumbnail.js"]]],
            ],
          ],
        ],
      ]
    );

    // Builtin on its own is the function itself, not a function call
    assertParse("expression", "mdHtml:", [ops.builtin, "mdHtml:"]);

    // Consecutive slahes in a path are removed
    assertParse("expression", "path//key", [
      ops.traverse,
      [ops.scope, "path/"],
      [ops.literal, "key"],
    ]);

    // Single slash at start of something = absolute file path
    assertParse("expression", "/path", [
      ops.rootDirectory,
      [ops.literal, "path"],
    ]);

    // Consecutive slashes at start of something = comment
    assertParse("expression", "x //comment", [ops.scope, "x"], "jse", false);

    assertParse("expression", "page.ori(mdHtml:(about.md))", [
      [ops.scope, "page.ori"],
      [
        [ops.builtin, "mdHtml:"],
        [ops.scope, "about.md"],
      ],
    ]);

    // Slash on its own is the root folder
    assertParse("expression", "keys /", [
      [ops.builtin, "keys"],
      [ops.rootDirectory],
    ]);

    assertParse("expression", "'Hello' -> test.orit", [
      [ops.scope, "test.orit"],
      [ops.literal, "Hello"],
    ]);
    assertParse("expression", "obj.json", [ops.scope, "obj.json"]);
    assertParse("expression", "(fn a, b, c)", [
      [ops.builtin, "fn"],
      [undetermined, "a"],
      [undetermined, "b"],
      [undetermined, "c"],
    ]);
    assertParse("expression", "foo.bar('hello', 'world')", [
      [ops.scope, "foo.bar"],
      [ops.literal, "hello"],
      [ops.literal, "world"],
    ]);
    assertParse("expression", "(key)('a')", [
      [ops.scope, "key"],
      [ops.literal, "a"],
    ]);
    assertParse("expression", "1", [ops.literal, 1]);
    assertParse("expression", "{ a: 1, b: 2 }", [
      ops.object,
      ["a", [ops.literal, 1]],
      ["b", [ops.literal, 2]],
    ]);
    assertParse("expression", "serve { index.html: 'hello' }", [
      [ops.builtin, "serve"],
      [ops.object, ["index.html", [ops.literal, "hello"]]],
    ]);
    assertParse("expression", "fn =`x`", [
      [ops.builtin, "fn"],
      [
        ops.lambda,
        [[ops.literal, "_"]],
        [ops.templateTree, [ops.literal, ["x"]]],
      ],
    ]);
    assertParse("expression", "copy app.js(formulas), files:snapshot", [
      [ops.builtin, "copy"],
      [
        [ops.scope, "app.js"],
        [ops.scope, "formulas"],
      ],
      [
        [ops.builtin, "files:"],
        [ops.literal, "snapshot"],
      ],
    ]);
    assertParse("expression", "map =`<li>${_}</li>`", [
      [ops.builtin, "map"],
      [
        ops.lambda,
        [[ops.literal, "_"]],
        [ops.templateTree, [ops.literal, ["<li>", "</li>"]], [ops.scope, "_"]],
      ],
    ]);
    assertParse("expression", `https://example.com/about/`, [
      [ops.builtin, "https:"],
      [ops.literal, "example.com/"],
      [ops.literal, "about/"],
    ]);
    assertParse("expression", "tag`Hello, ${name}!`", [
      [ops.builtin, "tag"],
      [ops.literal, ["Hello, ", "!"]],
      [ops.concat, [ops.scope, "name"]],
    ]);
    assertParse("expression", "(post, slug) => fn.js(post, slug)", [
      ops.lambda,
      [
        [ops.literal, "post"],
        [ops.literal, "slug"],
      ],
      [
        [ops.scope, "fn.js"],
        [ops.scope, "post"],
        [ops.scope, "slug"],
      ],
    ]);
    assertParse("expression", "keys ~", [
      [ops.builtin, "keys"],
      [ops.homeDirectory],
    ]);
    assertParse("expression", "keys /Users/alice", [
      [ops.builtin, "keys"],
      [
        ops.traverse,
        [ops.rootDirectory, [ops.literal, "Users/"]],
        [ops.literal, "alice"],
      ],
    ]);

    // Verify parser treatment of identifiers containing operators
    assertParse("expression", "a + b", [
      ops.addition,
      [undetermined, "a"],
      [undetermined, "b"],
    ]);
    assertParse("expression", "a+b", [ops.scope, "a+b"]);
    assertParse("expression", "a - b", [
      ops.subtraction,
      [undetermined, "a"],
      [undetermined, "b"],
    ]);
    assertParse("expression", "a-b", [ops.scope, "a-b"]);
    assertParse("expression", "a&b", [ops.scope, "a&b"]);
    assertParse("expression", "a & b", [
      ops.bitwiseAnd,
      [undetermined, "a"],
      [undetermined, "b"],
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
        [[ops.scope, "_template"], undefined],
      ],
      "jse",
      false
    );
  });

  test("group", () => {
    assertParse("group", "(hello)", [ops.scope, "hello"]);
    assertParse("group", "(((nested)))", [ops.scope, "nested"]);
    assertParse("group", "(fn())", [[ops.builtin, "fn"], undefined]);
    assertParse("group", "(a -> b)", [
      [ops.builtin, "b"],
      [ops.scope, "a"],
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
      [ops.builtin, "fn"],
      [undetermined, "arg"],
    ]);
    assertParse("implicitParenthesesCallExpression", "page.ori 'a', 'b'", [
      [ops.scope, "page.ori"],
      [ops.literal, "a"],
      [ops.literal, "b"],
    ]);
    assertParse("implicitParenthesesCallExpression", "fn a(b), c", [
      [ops.builtin, "fn"],
      [
        [ops.builtin, "a"],
        [ops.scope, "b"],
      ],
      [undetermined, "c"],
    ]);
    assertParse("implicitParenthesesCallExpression", "(fn()) 'arg'", [
      [[ops.builtin, "fn"], undefined],
      [ops.literal, "arg"],
    ]);
    assertParse("implicitParenthesesCallExpression", "tree/key arg", [
      [ops.traverse, [ops.scope, "tree/"], [ops.literal, "key"]],
      [undetermined, "arg"],
    ]);
    assertParse("implicitParenthesesCallExpression", "foo.js bar.ori 'arg'", [
      [ops.scope, "foo.js"],
      [
        [ops.scope, "bar.ori"],
        [ops.literal, "arg"],
      ],
    ]);
  });

  test("jsIdentifier", () => {
    assertParse("jsIdentifier", "foo", "foo", "jse", false);
    assertParse("jsIdentifier", "$Δelta", "$Δelta", "jse", false);
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
    assertThrows("list", "1\n2\n3", `but "\\n" found`, 0, "jse");
    assertParse("list", "'a' , 'b' , 'c'", [
      [ops.literal, "a"],
      [ops.literal, "b"],
      [ops.literal, "c"],
    ]);
  });

  test("logicalAndExpression", () => {
    assertParse("logicalAndExpression", "true && false", [
      ops.logicalAnd,
      [ops.scope, "true"],
      [ops.lambda, [], [undetermined, "false"]],
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
      [ops.scope, "false"],
      [ops.lambda, [], [undetermined, "false"]],
      [ops.lambda, [], [undetermined, "true"]],
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
    assertParse("namespace", "js:", [ops.builtin, "js:"]);
  });

  test("newExpression", () => {
    assertParse("newExpression", "new Foo()", [
      ops.construct,
      [ops.scope, "Foo"],
    ]);
  });

  test("nullishCoalescingExpression", () => {
    assertParse("nullishCoalescingExpression", "a ?? b", [
      ops.nullishCoalescing,
      [ops.scope, "a"],
      [ops.lambda, [], [undetermined, "b"]],
    ]);
    assertParse("nullishCoalescingExpression", "a ?? b ?? c", [
      ops.nullishCoalescing,
      [ops.scope, "a"],
      [ops.lambda, [], [undetermined, "b"]],
      [ops.lambda, [], [undetermined, "c"]],
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
      ["b", [ops.inherited, "b"]],
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
      ["a", [ops.getter, [ops.scope, "b"]]],
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
        ["a", [ops.getter, [ops.scope, "b"]]],
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
        [ops.object, ["b", [ops.getter, [[ops.builtin, "fn"], undefined]]]],
      ],
    ]);
    assertParse("objectLiteral", "{ x = fn.js('a') }", [
      ops.object,
      [
        "x",
        [
          ops.getter,
          [
            [ops.scope, "fn.js"],
            [ops.literal, "a"],
          ],
        ],
      ],
    ]);
    assertParse("objectLiteral", "{ a: 1, ...b }", [
      ops.merge,
      [ops.object, ["a", [ops.literal, 1]]],
      [ops.scope, "b"],
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
  });

  test("objectEntry", () => {
    assertParse("objectEntry", "foo", ["foo", [ops.inherited, "foo"]]);
    assertParse("objectEntry", "x: y", ["x", [ops.scope, "y"]]);
    assertParse("objectEntry", "a: a", ["a", [ops.inherited, "a"]]);
    assertParse("objectEntry", "a: (a) => a", [
      "a",
      [ops.lambda, [[ops.literal, "a"]], [ops.scope, "a"]],
    ]);
    assertParse("objectEntry", "posts/: map(posts, post.ori)", [
      "posts/",
      [
        [ops.builtin, "map"],
        [ops.inherited, "posts"],
        [ops.scope, "post.ori"],
      ],
    ]);
  });

  test("objectGetter", () => {
    assertParse("objectGetter", "data = obj.json", [
      "data",
      [ops.getter, [ops.scope, "obj.json"]],
    ]);
    assertParse("objectGetter", "foo = page.ori 'bar'", [
      "foo",
      [
        ops.getter,
        [
          [ops.scope, "page.ori"],
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
        [ops.builtin, "fn"],
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
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
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
    assertParse("pathArguments", "/", [ops.traverse]);
    assertParse("pathArguments", "/tree", [
      ops.traverse,
      [ops.literal, "tree"],
    ]);
    assertParse("pathArguments", "/tree/", [
      ops.traverse,
      [ops.literal, "tree/"],
    ]);
  });

  test("pipelineExpression", () => {
    assertParse("pipelineExpression", "foo", [ops.scope, "foo"]);
    assertParse("pipelineExpression", "a -> b", [
      [ops.builtin, "b"],
      [ops.scope, "a"],
    ]);
    assertParse("pipelineExpression", "input → one.js → two.js", [
      [ops.scope, "two.js"],
      [
        [ops.scope, "one.js"],
        [ops.scope, "input"],
      ],
    ]);
    assertParse("pipelineExpression", "fn a -> b", [
      [ops.builtin, "b"],
      [
        [ops.builtin, "fn"],
        [undetermined, "a"],
      ],
    ]);
  });

  test("primary", () => {
    assertParse("primary", "foo.js", [ops.scope, "foo.js"]);
    assertParse("primary", "[1, 2]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, 2],
    ]);
    // Only in JSE
    assertParse(
      "primary",
      "<index.html>",
      [ops.scope, "index.html"],
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
    assertParse("protocolExpression", "foo://bar", [
      [ops.builtin, "foo:"],
      [ops.literal, "bar"],
    ]);
    assertParse("protocolExpression", "http://example.com", [
      [ops.builtin, "http:"],
      [ops.literal, "example.com"],
    ]);
    assertParse("protocolExpression", "https://example.com/about/", [
      [ops.builtin, "https:"],
      [ops.literal, "example.com/"],
      [ops.literal, "about/"],
    ]);
    assertParse("protocolExpression", "https://example.com/about/index.html", [
      [ops.builtin, "https:"],
      [ops.literal, "example.com/"],
      [ops.literal, "about/"],
      [ops.literal, "index.html"],
    ]);
    assertParse("protocolExpression", "http://localhost:5000/foo", [
      [ops.builtin, "http:"],
      [ops.literal, "localhost:5000/"],
      [ops.literal, "foo"],
    ]);
    assertParse("protocolExpression", "files:///foo/bar.txt", [
      [ops.builtin, "files:"],
      [ops.literal, "/"],
      [ops.literal, "foo/"],
      [ops.literal, "bar.txt"],
    ]);
  });

  test("qualifiedReference", () => {
    assertParse("qualifiedReference", "js:Date", [
      [ops.builtin, "js:"],
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

  test("rootDirectory", () => {
    assertParse("rootDirectory", "/", [ops.rootDirectory]);
  });

  test("scopeReference", () => {
    assertParse("scopeReference", "keys", [undetermined, "keys"]);
    assertParse("scopeReference", "greet.js", [ops.scope, "greet.js"]);
    // scopeReference checks whether a slash follows; hard to test in isolation
    // assertParse("scopeReference", "markdown/", [ops.scope, "markdown"]);
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
      [undetermined, "message"],
    ]);
    assertParse("shorthandFunction", "=`Hello, ${name}.`", [
      ops.lambda,
      [[ops.literal, "_"]],
      [ops.templateTree, [ops.literal, ["Hello, ", "."]], [ops.scope, "name"]],
    ]);
    assertParse("shorthandFunction", "=indent`hello`", [
      ops.lambda,
      [[ops.literal, "_"]],
      [
        [ops.builtin, "indent"],
        [ops.literal, ["hello"]],
      ],
    ]);
  });

  test("singleLineComment", () => {
    assertParse("singleLineComment", "// Hello, world!", null, "jse", false);
  });

  test("spreadElement", () => {
    assertParse("spreadElement", "...a", [ops.spread, [ops.scope, "a"]]);
    assertParse("spreadElement", "…a", [ops.spread, [ops.scope, "a"]]);
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
      [ops.scope, "foo"],
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
            [ops.scope, "title"],
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
      [ops.scope, "x"],
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
        [ops.builtin, "map:"],
        [ops.scope, "people"],
        [
          ops.lambda,
          [[ops.literal, "_"]],
          [ops.templateTree, [ops.literal, ["", ""]], [ops.scope, "name"]],
        ],
      ],
    ]);
  });

  test("templateSubtitution", () => {
    assertParse(
      "templateSubstitution",
      "${foo}",
      [ops.scope, "foo"],
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
      [undetermined, "true"],
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
