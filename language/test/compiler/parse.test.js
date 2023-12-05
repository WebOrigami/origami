import assert from "node:assert";
import { describe, test } from "node:test";
import { parse } from "../../src/compiler/parse.js";
import * as ops from "../../src/runtime/ops.js";

describe("Origami parser", () => {
  test("absoluteFilePath", () => {
    assertParse("absoluteFilePath", "/foo/bar", [
      [ops.filesRoot],
      "foo",
      "bar",
    ]);
  });

  test("argsChain", () => {
    assertParse("argsChain", "(a)(b)(c)", [
      [[ops.scope, "a"]],
      [[ops.scope, "b"]],
      [[ops.scope, "c"]],
    ]);
    assertParse("argsChain", "(a)/b(c)", [
      [[ops.scope, "a"]],
      ["b"],
      [[ops.scope, "c"]],
    ]);
  });

  test("array", () => {
    assertParse("array", "[]", [ops.array]);
    assertParse("array", "[1, 2, 3]", [ops.array, 1, 2, 3]);
  });

  test("assignment", () => {
    assertParse("assignment", "data = obj.json", [
      "data",
      [ops.scope, "obj.json"],
    ]);
    assertParse("assignment", "foo = fn 'bar'", [
      "foo",
      [[ops.scope, "fn"], "bar"],
    ]);
  });

  test("assignmentOrShorthand", () => {
    assertParse("assignmentOrShorthand", "foo", [
      "foo",
      [ops.inherited, "foo"],
    ]);
    assertParse("assignmentOrShorthand", "foo = 1", ["foo", 1]);
  });

  test("expr", () => {
    assertParse("expr", "obj.json", [ops.scope, "obj.json"]);
    assertParse("expr", "(fn a, b, c)", [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse("expr", "foo.bar('hello', 'world')", [
      [ops.scope, "foo.bar"],
      "hello",
      "world",
    ]);
    assertParse("expr", "(fn)('a')", [[ops.scope, "fn"], "a"]);
    assertParse("expr", "1", 1);
    assertParse("expr", "{ a: 1, b: 2 }", [ops.object, ["a", 1], ["b", 2]]);
    assertParse("expr", "serve { index.html: 'hello' }", [
      [ops.scope, "serve"],
      [ops.object, ["index.html", "hello"]],
    ]);
    assertParse("expr", "fn =`x`", [
      [ops.scope, "fn"],
      [ops.lambda, "x"],
    ]);
    assertParse("expr", "copy app(formulas), files 'snapshot'", [
      [ops.scope, "copy"],
      [
        [ops.scope, "app"],
        [ops.scope, "formulas"],
      ],
      [[ops.scope, "files"], "snapshot"],
    ]);
    assertParse("expr", "@map =`<li>{{_}}</li>`", [
      [ops.scope, "@map"],
      [ops.lambda, [ops.concat, "<li>", [ops.scope, "_"], "</li>"]],
    ]);
    assertParse("expr", `"https://example.com"`, "https://example.com");
  });

  test("expression", () => {
    assertParse(
      "expression",
      `
        {
          index.html = index.orit(teamData.yaml)
          thumbnails = @map(images, { valueMap: thumbnail.js })
        }
      `,
      [
        ops.tree,
        [
          "index.html",
          [
            [ops.scope, "index.orit"],
            [ops.scope, "teamData.yaml"],
          ],
        ],
        [
          "thumbnails",
          [
            [ops.scope, "@map"],
            [ops.scope, "images"],
            [ops.object, ["valueMap", [ops.scope, "thumbnail.js"]]],
          ],
        ],
      ]
    );
  });

  test("functionComposition", () => {
    assertParse("functionComposition", "fn()", [[ops.scope, "fn"], undefined]);
    assertParse("functionComposition", "fn(arg)", [
      [ops.scope, "fn"],
      [ops.scope, "arg"],
    ]);
    assertParse("functionComposition", "fn(a, b)", [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("functionComposition", "fn()(arg)", [
      [[ops.scope, "fn"], undefined],
      [ops.scope, "arg"],
    ]);
    assertParse("functionComposition", "fn()/key", [
      [[ops.scope, "fn"], undefined],
      "key",
    ]);
    assertParse("functionComposition", "tree/", [[ops.scope, "tree"], ""]);
    assertParse("functionComposition", "tree/key", [
      [ops.scope, "tree"],
      "key",
    ]);
    assertParse("functionComposition", "tree/foo/bar", [
      [ops.scope, "tree"],
      "foo",
      "bar",
    ]);
    assertParse("functionComposition", "tree/key()", [
      [[ops.scope, "tree"], "key"],
      undefined,
    ]);
    assertParse("functionComposition", "fn()/key()", [
      [[[ops.scope, "fn"], undefined], "key"],
      undefined,
    ]);
    assertParse("functionComposition", "(fn())('arg')", [
      [[ops.scope, "fn"], undefined],
      "arg",
    ]);
    assertParse("functionComposition", "fn('a')('b')", [
      [[ops.scope, "fn"], "a"],
      "b",
    ]);
    assertParse("functionComposition", "(fn())(a, b)", [
      [[ops.scope, "fn"], undefined],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("functionComposition", "{ a: 1, b: 2}/b", [
      [ops.object, ["a", 1], ["b", 2]],
      "b",
    ]);
  });

  test("group", () => {
    assertParse("group", "(hello)", [ops.scope, "hello"]);
    assertParse("group", "(((nested)))", [ops.scope, "nested"]);
    assertParse("group", "(fn())", [[ops.scope, "fn"], undefined]);
  });

  test("host", () => {
    assertParse("host", "abc", "abc");
    assertParse("host", "abc:123", "abc:123");
  });

  test("identifier", () => {
    assertParse("identifier", "abc", "abc");
    assertParse("identifier", "index.html", "index.html");
    assertParse("identifier", "foo\\ bar", "foo bar");
  });

  test("implicitParensCall", () => {
    assertParse("implicitParensCall", "fn arg", [
      [ops.scope, "fn"],
      [ops.scope, "arg"],
    ]);
    assertParse("implicitParensCall", "fn 'a', 'b'", [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assertParse("implicitParensCall", "fn a(b), c", [
      [ops.scope, "fn"],
      [
        [ops.scope, "a"],
        [ops.scope, "b"],
      ],
      [ops.scope, "c"],
    ]);
    assertParse("implicitParensCall", "fn1 fn2 'arg'", [
      [ops.scope, "fn1"],
      [[ops.scope, "fn2"], "arg"],
    ]);
    assertParse("implicitParensCall", "(fn()) 'arg'", [
      [[ops.scope, "fn"], undefined],
      "arg",
    ]);
    assertParse("implicitParensCall", "https://example.com/tree.yaml 'key'", [
      [ops.https, "example.com", "tree.yaml"],
      "key",
    ]);
  });

  test("lambda", () => {
    assertParse("lambda", "=message", [ops.lambda, [ops.scope, "message"]]);
    assertParse("lambda", "=`Hello, {{name}}.`", [
      ops.lambda,
      [ops.concat, "Hello, ", [ops.scope, "name"], "."],
    ]);
  });

  test("leadingSlashPath", () => {
    assertParse("leadingSlashPath", "/tree/", ["tree", ""]);
  });

  describe("list", () => {
    assertParse("list", "1", [1]);
    assertParse("list", "1,2,3", [1, 2, 3]);
    assertParse("list", "1, 2, 3,", [1, 2, 3]);
    assertParse("list", "1 , 2 , 3", [1, 2, 3]);
    assertParse("list", "1\n2\n3", [1, 2, 3]);
    assertParse("list", "'a' , 'b' , 'c'", ["a", "b", "c"]);
  });

  test("number", () => {
    assertParse("number", "123", 123);
    assertParse("number", "-456", -456);
    assertParse("number", ".5", 0.5);
    assertParse("number", "123.45", 123.45);
    assertParse("number", "-678.90", -678.9);
    assertParse("number", "+123", 123);
    assertParse("number", "+456.78", 456.78);
  });

  test("object", () => {
    assertParse("object", "{}", [ops.object]);
    assertParse("object", "{ a: 1, b }", [
      ops.object,
      ["a", 1],
      ["b", [ops.inherited, "b"]],
    ]);
  });

  test("objectProperty", () => {
    assertParse("objectProperty", "a: 1", ["a", 1]);
    assertParse("objectProperty", "name: 'Alice'", ["name", "Alice"]);
    assertParse("objectProperty", "x: fn('a')", [
      "x",
      [[ops.scope, "fn"], "a"],
    ]);
  });

  test("objectPropertyOrShorthand", () => {
    assertParse("objectPropertyOrShorthand", "foo", [
      "foo",
      [ops.inherited, "foo"],
    ]);
    assertParse("objectPropertyOrShorthand", "x: y", ["x", [ops.scope, "y"]]);
  });

  test("parensArgs", () => {
    assertParse("parensArgs", "()", [undefined]);
    assertParse("parensArgs", "(a, b, c)", [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
  });

  test("path", () => {
    assertParse("path", "tree/", ["tree", ""]);
    assertParse("path", "month/12", ["month", "12"]);
    assertParse("path", "tree/foo/bar", ["tree", "foo", "bar"]);
  });

  test("protocolCall", () => {
    assertParse("protocolCall", "foo://bar", [[ops.scope, "foo"], "bar"]);
    assertParse("protocolCall", "https://example.com/foo/", [
      ops.https,
      "example.com",
      "foo",
      "",
    ]);
    assertParse("protocolCall", "http:example.com", [ops.http, "example.com"]);
    assertParse("protocolCall", "http://localhost:5000/foo", [
      ops.http,
      "localhost:5000",
      "foo",
    ]);
  });

  test("scopeReference", () => {
    assertParse("scopeReference", "x", [ops.scope, "x"]);
  });

  test("string", () => {
    assertParse("string", '"foo"', "foo");
    assertParse("string", "'bar'", "bar");
    assertParse("string", '"foo bar"', "foo bar");
    assertParse("string", "'bar baz'", "bar baz");
    assertParse("string", `"foo\\"s bar"`, `foo"s bar`);
    assertParse("string", `'bar\\'s baz'`, `bar's baz`);
  });

  test("templateDocument", () => {
    assertParse("templateDocument", "hello{{foo}}world", [
      ops.lambda,
      [ops.concat, "hello", [ops.scope, "foo"], "world"],
    ]);
    assertParse("templateDocument", "Documents can contain ` backticks", [
      ops.lambda,
      "Documents can contain ` backticks",
    ]);
  });

  test("templateLiteral", () => {
    assertParse("templateLiteral", "`Hello, world.`", "Hello, world.");
    assertParse("templateLiteral", "`foo {{x}} bar`", [
      ops.concat,
      "foo ",
      [ops.scope, "x"],
      " bar",
    ]);
    assertParse("templateLiteral", "`{{`nested`}}`", "nested");
    assertParse("templateLiteral", "`{{map(people, =`{{name}}`)}}`", [
      ops.concat,
      [
        [ops.scope, "map"],
        [ops.scope, "people"],
        [ops.lambda, [ops.concat, [ops.scope, "name"]]],
      ],
    ]);
  });

  test("templateSubstitution", () => {
    assertParse("templateSubstitution", "{{foo}}", [ops.scope, "foo"]);
  });

  test("tree", () => {
    assertParse("tree", "{}", [ops.tree]);
    assertParse("tree", "{ a = 1, b }", [
      ops.tree,
      ["a", 1],
      ["b", [ops.inherited, "b"]],
    ]);
    assertParse("tree", "{ x = fn('a') }", [
      ops.tree,
      ["x", [[ops.scope, "fn"], "a"]],
    ]);
  });

  test("whitespace block", () => {
    assertParse(
      "__",
      `  
  # First line of comment
  # Second line of comment
     `,
      ""
    );
  });
});

function assertParse(startRule, source, expected) {
  const actual = parse(source, { startRule });
  assert.deepEqual(actual, expected);
}
