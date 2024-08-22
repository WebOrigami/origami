import { isPlainObject } from "@weborigami/async-tree";
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

  test("array", () => {
    assertParse("array", "[]", [ops.array]);
    assertParse("array", "[1, 2, 3]", [ops.array, 1, 2, 3]);
    assertParse("array", "[ 1 , 2 , 3 ]", [ops.array, 1, 2, 3]);
    assertParse("array", "[ 1, ...[2, 3]]", [
      ops.merge,
      [ops.array, 1],
      [ops.array, 2, 3],
    ]);
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
      [ops.lambda, null, "x"],
    ]);
    assertParse("expr", "copy app(formulas), files 'snapshot'", [
      [ops.scope, "copy"],
      [
        [ops.scope, "app"],
        [ops.scope, "formulas"],
      ],
      [[ops.scope, "files"], "snapshot"],
    ]);
    assertParse("expr", "@map =`<li>${_}</li>`", [
      [ops.scope, "@map"],
      [ops.lambda, null, [ops.concat, "<li>", [ops.scope, "_"], "</li>"]],
    ]);
    assertParse("expr", `"https://example.com"`, "https://example.com");
    assertParse("expr", "'Hello' -> test.orit", [
      [ops.scope, "test.orit"],
      "Hello",
    ]);
  });

  test("expression", () => {
    assertParse(
      "expression",
      `
        {
          index.html = index.ori(teamData.yaml)
          thumbnails = @map(images, { value: thumbnail.js })
        }
      `,
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
              [ops.scope, "@map"],
              [ops.scope, "images"],
              [ops.object, ["value", [ops.scope, "thumbnail.js"]]],
            ],
          ],
        ],
      ]
    );

    // Consecutive slahes inside a path = empty string key
    assertParse("expression", "path//key", [
      ops.traverse,
      [ops.scope, "path"],
      "",
      "key",
    ]);
    // Single slash at start of something = absolute file path
    assertParse("expression", "/path", [[ops.filesRoot], "path"]);
    // Consecutive slashes at start of something = comment
    assertParse("expression", "path //comment", [ops.scope, "path"]);
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
    assertParse("functionComposition", "fn( a , b )", [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("functionComposition", "fn()(arg)", [
      [[ops.scope, "fn"], undefined],
      [ops.scope, "arg"],
    ]);
    assertParse("functionComposition", "fn()/key", [
      ops.traverse,
      [[ops.scope, "fn"], undefined],
      "key",
    ]);
    assertParse("functionComposition", "tree/", [
      ops.traverse,
      [ops.scope, "tree"],
      "",
    ]);
    assertParse("functionComposition", "tree/key", [
      ops.traverse,
      [ops.scope, "tree"],
      "key",
    ]);
    assertParse("functionComposition", "tree/foo/bar", [
      ops.traverse,
      [ops.scope, "tree"],
      "foo",
      "bar",
    ]);
    assertParse("functionComposition", "tree/key()", [
      [ops.traverse, [ops.scope, "tree"], "key"],
      undefined,
    ]);
    assertParse("functionComposition", "fn()/key()", [
      [ops.traverse, [[ops.scope, "fn"], undefined], "key"],
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
      ops.traverse,
      [ops.object, ["a", 1], ["b", 2]],
      "b",
    ]);
    assertParse("functionComposition", "fn arg", [
      [ops.scope, "fn"],
      [ops.scope, "arg"],
    ]);
    assertParse("functionComposition", "fn 'a', 'b'", [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assertParse("functionComposition", "fn a(b), c", [
      [ops.scope, "fn"],
      [
        [ops.scope, "a"],
        [ops.scope, "b"],
      ],
      [ops.scope, "c"],
    ]);
    assertParse("functionComposition", "fn1 fn2 'arg'", [
      [ops.scope, "fn1"],
      [[ops.scope, "fn2"], "arg"],
    ]);
    assertParse("functionComposition", "(fn()) 'arg'", [
      [[ops.scope, "fn"], undefined],
      "arg",
    ]);
    assertParse("functionComposition", "tree/key arg", [
      [ops.traverse, [ops.scope, "tree"], "key"],
      [ops.scope, "arg"],
    ]);
    assertParse("functionComposition", "https://example.com/tree.yaml 'key'", [
      [ops.https, "example.com", "tree.yaml"],
      "key",
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
    assertParse("identifier", "x-y-z", "x-y-z");
  });

  test("lambda", () => {
    assertParse("lambda", "=message", [
      ops.lambda,
      null,
      [ops.scope, "message"],
    ]);
    assertParse("lambda", "=`Hello, ${name}.`", [
      ops.lambda,
      null,
      [ops.concat, "Hello, ", [ops.scope, "name"], "."],
    ]);
  });

  test("leadingSlashPath", () => {
    assertParse("leadingSlashPath", "/tree/", ["tree", ""]);
  });

  test("list", () => {
    assertParse("list", "1", [1]);
    assertParse("list", "1,2,3", [1, 2, 3]);
    assertParse("list", "1, 2, 3,", [1, 2, 3]);
    assertParse("list", "1 , 2 , 3", [1, 2, 3]);
    assertParse("list", "1\n2\n3", [1, 2, 3]);
    assertParse("list", "'a' , 'b' , 'c'", ["a", "b", "c"]);
  });

  test("multiLineComment", () => {
    assertParse("multiLineComment", "/*\nHello, world!\n*/", null);
  });

  test("new", () => {
    assertParse("expression", "new:@js/Date('2025-01-01')", [
      [ops.constructor, "@js", "Date"],
      "2025-01-01",
    ]);
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
    assertParse("object", `{ "a": 1, "b": 2 }`, [
      ops.object,
      ["a", 1],
      ["b", 2],
    ]);
    assertParse("object", "{ a = b, b: 2 }", [
      ops.object,
      ["a", [ops.getter, [ops.scope, "b"]]],
      ["b", 2],
    ]);
    assertParse("object", "{ x = fn('a') }", [
      ops.object,
      ["x", [ops.getter, [[ops.scope, "fn"], "a"]]],
    ]);
    assertParse("object", "{ a: 1, ...b }", [
      ops.merge,
      [ops.object, ["a", 1]],
      [ops.scope, "b"],
    ]);
    assertParse("object", "{ (a): 1 }", [ops.object, ["(a)", 1]]);
  });

  test("objectEntry", () => {
    assertParse("objectEntry", "foo", ["foo", [ops.inherited, "foo"]]);
    assertParse("objectEntry", "x: y", ["x", [ops.scope, "y"]]);
  });

  test("objectGetter", () => {
    assertParse("objectGetter", "data = obj.json", [
      "data",
      [ops.getter, [ops.scope, "obj.json"]],
    ]);
    assertParse("objectGetter", "foo = fn 'bar'", [
      "foo",
      [ops.getter, [[ops.scope, "fn"], "bar"]],
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

  test("parameterizedLambda", () => {
    assertParse("parameterizedLambda", "() => foo", [
      ops.lambda,
      [],
      [ops.scope, "foo"],
    ]);
    assertParse("parameterizedLambda", "(a, b, c) ⇒ fn(a, b, c)", [
      ops.lambda,
      ["a", "b", "c"],
      [
        [ops.scope, "fn"],
        [ops.scope, "a"],
        [ops.scope, "b"],
        [ops.scope, "c"],
      ],
    ]);
    assertParse("parameterizedLambda", "(a) => (b) => fn(a, b)", [
      ops.lambda,
      ["a"],
      [
        ops.lambda,
        ["b"],
        [
          [ops.scope, "fn"],
          [ops.scope, "a"],
          [ops.scope, "b"],
        ],
      ],
    ]);
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

  test("pipeline", () => {
    assertParse("pipeline", "a -> b", [
      [ops.scope, "b"],
      [ops.scope, "a"],
    ]);
    assertParse("pipeline", "input → one.js → two.js", [
      [ops.scope, "two.js"],
      [
        [ops.scope, "one.js"],
        [ops.scope, "input"],
      ],
    ]);
    assertParse("pipeline", "fn a -> b", [
      [ops.scope, "b"],
      [
        [ops.scope, "fn"],
        [ops.scope, "a"],
      ],
    ]);
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

  test("shebang", () => {
    assertParse(
      "expression",
      `#!/usr/bin/env ori @invoke
'Hello'
`,
      "Hello"
    );
  });

  test("singleLineComment", () => {
    assertParse("singleLineComment", "// Hello, world!", null);
  });

  test("scopeReference", () => {
    assertParse("scopeReference", "x", [ops.scope, "x"]);
  });

  test("spread", () => {
    assertParse("spread", "...a", [ops.spread, [ops.scope, "a"]]);
    assertParse("spread", "…a", [ops.spread, [ops.scope, "a"]]);
  });

  test("string", () => {
    assertParse("string", '"foo"', "foo");
    assertParse("string", "'bar'", "bar");
    assertParse("string", '"foo bar"', "foo bar");
    assertParse("string", "'bar baz'", "bar baz");
    assertParse("string", `"foo\\"s bar"`, `foo"s bar`);
    assertParse("string", `'bar\\'s baz'`, `bar's baz`);
    assertParse("string", `«string»`, "string");
  });

  test("templateDocument", () => {
    assertParse("templateDocument", "hello${foo}world", [
      ops.lambda,
      null,
      [ops.concat, "hello", [ops.scope, "foo"], "world"],
    ]);
    assertParse("templateDocument", "Documents can contain ` backticks", [
      ops.lambda,
      null,
      "Documents can contain ` backticks",
    ]);
  });

  test("templateLiteral", () => {
    assertParse("templateLiteral", "`Hello, world.`", "Hello, world.");
    assertParse("templateLiteral", "`foo ${x} bar`", [
      ops.concat,
      "foo ",
      [ops.scope, "x"],
      " bar",
    ]);
    assertParse("templateLiteral", "`${`nested`}`", "nested");
    assertParse("templateLiteral", "`${map(people, =`${name}`)}`", [
      ops.concat,
      [
        [ops.scope, "map"],
        [ops.scope, "people"],
        [ops.lambda, null, [ops.concat, [ops.scope, "name"]]],
      ],
    ]);
  });

  test("templateLiteral (JS)", () => {
    assertParse("templateLiteral", "`Hello, world.`", "Hello, world.");
    assertParse("templateLiteral", "`foo ${x} bar`", [
      ops.concat,
      "foo ",
      [ops.scope, "x"],
      " bar",
    ]);
    assertParse("templateLiteral", "`${`nested`}`", "nested");
    assertParse("templateLiteral", "`${map(people, =`${name}`)}`", [
      ops.concat,
      [
        [ops.scope, "map"],
        [ops.scope, "people"],
        [ops.lambda, null, [ops.concat, [ops.scope, "name"]]],
      ],
    ]);
  });

  test("templateSubtitution", () => {
    assertParse("templateSubstitution", "${foo}", [ops.scope, "foo"]);
  });

  test("whitespace block", () => {
    assertParse(
      "__",
      `  
  // First comment
  // Second comment
     `,
      ""
    );
  });
});

function assertParse(startRule, source, expected) {
  /** @type {any} */
  const parseResult = parse(source, { grammarSource: source, startRule });
  const actual = stripLocations(parseResult);
  assert.deepEqual(actual, expected);
}

// For comparison purposes, strip the `location` property added by the parser.
function stripLocations(parseResult) {
  if (Array.isArray(parseResult)) {
    return parseResult.map(stripLocations);
  } else if (isPlainObject(parseResult)) {
    const result = {};
    for (const key in parseResult) {
      if (key !== "location") {
        result[key] = stripLocations(parseResult[key]);
      }
    }
    return result;
  } else {
    return parseResult;
  }
}
