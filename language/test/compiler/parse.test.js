import { isPlainObject } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import { parse } from "../../src/compiler/parse.js";
import * as ops from "../../src/runtime/ops.js";

describe("Origami parser", () => {
  test("absoluteFilePath", () => {
    assertParse("absoluteFilePath", "/foo/bar", [
      [ops.filesRoot],
      [ops.primitive, "foo/"],
      [ops.primitive, "bar"],
    ]);
  });

  test("array", () => {
    assertParse("array", "[]", [ops.array]);
    assertParse("array", "[1, 2, 3]", [
      ops.array,
      [ops.primitive, 1],
      [ops.primitive, 2],
      [ops.primitive, 3],
    ]);
    assertParse("array", "[ 1 , 2 , 3 ]", [
      ops.array,
      [ops.primitive, 1],
      [ops.primitive, 2],
      [ops.primitive, 3],
    ]);
    assertParse("array", "[ 1, ...[2, 3]]", [
      ops.merge,
      [ops.array, [ops.primitive, 1]],
      [ops.array, [ops.primitive, 2], [ops.primitive, 3]],
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
      [ops.primitive, "hello"],
      [ops.primitive, "world"],
    ]);
    assertParse("expr", "(fn)('a')", [
      [ops.scope, "fn"],
      [ops.primitive, "a"],
    ]);
    assertParse("expr", "1", [ops.primitive, 1]);
    assertParse("expr", "{ a: 1, b: 2 }", [
      ops.object,
      ["a", [ops.primitive, 1]],
      ["b", [ops.primitive, 2]],
    ]);
    assertParse("expr", "serve { index.html: 'hello' }", [
      [ops.scope, "serve"],
      [ops.object, ["index.html", [ops.primitive, "hello"]]],
    ]);
    assertParse("expr", "fn =`x`", [
      [ops.scope, "fn"],
      [ops.lambda, null, [ops.primitive, "x"]],
    ]);
    assertParse("expr", "copy app(formulas), files 'snapshot'", [
      [ops.scope, "copy"],
      [
        [ops.scope, "app"],
        [ops.scope, "formulas"],
      ],
      [
        [ops.scope, "files"],
        [ops.primitive, "snapshot"],
      ],
    ]);
    assertParse("expr", "@map =`<li>${_}</li>`", [
      [ops.scope, "@map"],
      [
        ops.lambda,
        null,
        [
          ops.concat,
          [ops.primitive, "<li>"],
          [ops.scope, "_"],
          [ops.primitive, "</li>"],
        ],
      ],
    ]);
    assertParse("expr", `"https://example.com"`, [
      ops.primitive,
      "https://example.com",
    ]);
    assertParse("expr", "'Hello' -> test.orit", [
      [ops.scope, "test.orit"],
      [ops.primitive, "Hello"],
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

    // Consecutive slahes in a path are removed
    assertParse("expression", "path//key", [
      ops.traverse,
      [ops.scope, "path/"],
      [ops.primitive, "key"],
    ]);
    // Single slash at start of something = absolute file path
    assertParse("expression", "/path", [
      [ops.filesRoot],
      [ops.primitive, "path"],
    ]);
    // Consecutive slashes at start of something = comment
    assertParse("expression", "path //comment", [ops.scope, "path"], false);
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
      [ops.primitive, "key"],
    ]);
    assertParse("functionComposition", "tree/", [
      ops.traverse,
      [ops.scope, "tree/"],
    ]);
    assertParse("functionComposition", "tree/key", [
      ops.traverse,
      [ops.scope, "tree/"],
      [ops.primitive, "key"],
    ]);
    assertParse("functionComposition", "tree/foo/bar", [
      ops.traverse,
      [ops.scope, "tree/"],
      [ops.primitive, "foo/"],
      [ops.primitive, "bar"],
    ]);
    assertParse("functionComposition", "tree/key()", [
      [ops.traverse, [ops.scope, "tree/"], [ops.primitive, "key"]],
      undefined,
    ]);
    assertParse("functionComposition", "(tree)/", [
      ops.unpack,
      [ops.scope, "tree"],
    ]);
    assertParse("functionComposition", "fn()/key()", [
      [ops.traverse, [[ops.scope, "fn"], undefined], [ops.primitive, "key"]],
      undefined,
    ]);
    assertParse("functionComposition", "(fn())('arg')", [
      [[ops.scope, "fn"], undefined],
      [ops.primitive, "arg"],
    ]);
    assertParse("functionComposition", "fn('a')('b')", [
      [
        [ops.scope, "fn"],
        [ops.primitive, "a"],
      ],
      [ops.primitive, "b"],
    ]);
    assertParse("functionComposition", "(fn())(a, b)", [
      [[ops.scope, "fn"], undefined],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("functionComposition", "{ a: 1, b: 2}/b", [
      ops.traverse,
      [ops.object, ["a", [ops.primitive, 1]], ["b", [ops.primitive, 2]]],
      [ops.primitive, "b"],
    ]);
    assertParse("functionComposition", "fn arg", [
      [ops.scope, "fn"],
      [ops.scope, "arg"],
    ]);
    assertParse("functionComposition", "fn 'a', 'b'", [
      [ops.scope, "fn"],
      [ops.primitive, "a"],
      [ops.primitive, "b"],
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
      [
        [ops.scope, "fn2"],
        [ops.primitive, "arg"],
      ],
    ]);
    assertParse("functionComposition", "(fn()) 'arg'", [
      [[ops.scope, "fn"], undefined],
      [ops.primitive, "arg"],
    ]);
    assertParse("functionComposition", "tree/key arg", [
      [ops.traverse, [ops.scope, "tree/"], [ops.primitive, "key"]],
      [ops.scope, "arg"],
    ]);
    assertParse("functionComposition", "https://example.com/tree.yaml 'key'", [
      [ops.https, [ops.primitive, "example.com"], [ops.primitive, "tree.yaml"]],
      [ops.primitive, "key"],
    ]);
  });

  test("group", () => {
    assertParse("group", "(hello)", [ops.scope, "hello"]);
    assertParse("group", "(((nested)))", [ops.scope, "nested"]);
    assertParse("group", "(fn())", [[ops.scope, "fn"], undefined]);
  });

  test("host", () => {
    assertParse("host", "abc", [ops.primitive, "abc"]);
    assertParse("host", "abc:123", [ops.primitive, "abc:123"]);
    assertParse("host", "foo\\ bar", [ops.primitive, "foo bar"]);
  });

  test("identifier", () => {
    assertParse("identifier", "abc", "abc", false);
    assertParse("identifier", "index.html", "index.html", false);
    assertParse("identifier", "foo\\ bar", "foo bar", false);
    assertParse("identifier", "x-y-z", "x-y-z", false);
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
      [
        ops.concat,
        [ops.primitive, "Hello, "],
        [ops.scope, "name"],
        [ops.primitive, "."],
      ],
    ]);
  });

  test("leadingSlashPath", () => {
    assertParse("leadingSlashPath", "/", []);
    assertParse("leadingSlashPath", "/tree", [[ops.primitive, "tree"]]);
    assertParse("leadingSlashPath", "/tree/", [[ops.primitive, "tree/"]]);
  });

  test("list", () => {
    assertParse("list", "1", [[ops.primitive, 1]]);
    assertParse("list", "1,2,3", [
      [ops.primitive, 1],
      [ops.primitive, 2],
      [ops.primitive, 3],
    ]);
    assertParse("list", "1, 2, 3,", [
      [ops.primitive, 1],
      [ops.primitive, 2],
      [ops.primitive, 3],
    ]);
    assertParse("list", "1 , 2 , 3", [
      [ops.primitive, 1],
      [ops.primitive, 2],
      [ops.primitive, 3],
    ]);
    assertParse("list", "1\n2\n3", [
      [ops.primitive, 1],
      [ops.primitive, 2],
      [ops.primitive, 3],
    ]);
    assertParse("list", "'a' , 'b' , 'c'", [
      [ops.primitive, "a"],
      [ops.primitive, "b"],
      [ops.primitive, "c"],
    ]);
  });

  test("multiLineComment", () => {
    assertParse("multiLineComment", "/*\nHello, world!\n*/", null, false);
  });

  test("new", () => {
    assertParse("expression", "new:@js/Date('2025-01-01')", [
      [ops.constructor, [ops.primitive, "@js"], [ops.primitive, "Date"]],
      [ops.primitive, "2025-01-01"],
    ]);
  });

  test("number", () => {
    assertParse("number", "123", [ops.primitive, 123]);
    assertParse("number", "-456", [ops.primitive, -456]);
    assertParse("number", ".5", [ops.primitive, 0.5]);
    assertParse("number", "123.45", [ops.primitive, 123.45]);
    assertParse("number", "-678.90", [ops.primitive, -678.9]);
    assertParse("number", "+123", [ops.primitive, 123]);
    assertParse("number", "+456.78", [ops.primitive, 456.78]);
  });

  test("object", () => {
    assertParse("object", "{}", [ops.object]);
    assertParse("object", "{ a: 1, b }", [
      ops.object,
      ["a", [ops.primitive, 1]],
      ["b", [ops.inherited, "b"]],
    ]);
    assertParse("object", "{ sub: { a: 1 } }", [
      ops.object,
      ["sub", [ops.object, ["a", [ops.primitive, 1]]]],
    ]);
    assertParse("object", "{ sub: { a/: 1 } }", [
      ops.object,
      ["sub", [ops.object, ["a/", [ops.primitive, 1]]]],
    ]);
    assertParse("object", `{ "a": 1, "b": 2 }`, [
      ops.object,
      ["a", [ops.primitive, 1]],
      ["b", [ops.primitive, 2]],
    ]);
    assertParse("object", "{ a = b, b = 2 }", [
      ops.object,
      ["a", [ops.getter, [ops.scope, "b"]]],
      ["b", [ops.primitive, 2]],
    ]);
    assertParse("object", "{ a: { b: 1 } }", [
      ops.object,
      ["a", [ops.object, ["b", [ops.primitive, 1]]]],
    ]);
    assertParse("object", "{ a: { b = 1 } }", [
      ops.object,
      ["a", [ops.object, ["b", [ops.primitive, 1]]]],
    ]);
    assertParse("object", "{ a: { b = fn() } }", [
      ops.object,
      ["a/", [ops.object, ["b", [ops.getter, [[ops.scope, "fn"], undefined]]]]],
    ]);
    assertParse("object", "{ x = fn('a') }", [
      ops.object,
      [
        "x",
        [
          ops.getter,
          [
            [ops.scope, "fn"],
            [ops.primitive, "a"],
          ],
        ],
      ],
    ]);
    assertParse("object", "{ a: 1, ...b }", [
      ops.merge,
      [ops.object, ["a", [ops.primitive, 1]]],
      [ops.scope, "b"],
    ]);
    assertParse("object", "{ (a): 1 }", [
      ops.object,
      ["(a)", [ops.primitive, 1]],
    ]);
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
      [
        ops.getter,
        [
          [ops.scope, "fn"],
          [ops.primitive, "bar"],
        ],
      ],
    ]);
  });

  test("objectProperty", () => {
    assertParse("objectProperty", "a: 1", ["a", [ops.primitive, 1]]);
    assertParse("objectProperty", "name: 'Alice'", [
      "name",
      [ops.primitive, "Alice"],
    ]);
    assertParse("objectProperty", "x: fn('a')", [
      "x",
      [
        [ops.scope, "fn"],
        [ops.primitive, "a"],
      ],
    ]);
  });

  test("objectPublicKey", () => {
    assertParse("objectPublicKey", "a", "a", false);
    assertParse("objectPublicKey", "markdown/", "markdown/", false);
    assertParse("objectPublicKey", "foo\\ bar", "foo bar", false);
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
    assertParse("path", "tree/", [[ops.primitive, "tree/"]]);
    assertParse("path", "month/12", [
      [ops.primitive, "month/"],
      [ops.primitive, "12"],
    ]);
    assertParse("path", "tree/foo/bar", [
      [ops.primitive, "tree/"],
      [ops.primitive, "foo/"],
      [ops.primitive, "bar"],
    ]);
    assertParse("path", "a///b", [
      [ops.primitive, "a/"],
      [ops.primitive, "b"],
    ]);
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
    assertParse("protocolCall", "foo://bar", [
      [ops.scope, "foo"],
      [ops.primitive, "bar"],
    ]);
    assertParse("protocolCall", "https://example.com/foo/", [
      ops.https,
      [ops.primitive, "example.com"],
      [ops.primitive, "foo/"],
    ]);
    assertParse("protocolCall", "http:example.com", [
      ops.http,
      [ops.primitive, "example.com"],
    ]);
    assertParse("protocolCall", "http://localhost:5000/foo", [
      ops.http,
      [ops.primitive, "localhost:5000"],
      [ops.primitive, "foo"],
    ]);
  });

  test("scopeReference", () => {
    assertParse("scopeReference", "x", [ops.scope, "x"]);
  });

  test("scopeTraverse", () => {
    assertParse("scopeTraverse", "tree/foo/bar", [
      ops.traverse,
      [ops.scope, "tree/"],
      [ops.primitive, "foo/"],
      [ops.primitive, "bar"],
    ]);
    assertParse("scopeTraverse", "tree/foo/bar/", [
      ops.traverse,
      [ops.scope, "tree/"],
      [ops.primitive, "foo/"],
      [ops.primitive, "bar/"],
    ]);
  });

  test("shebang", () => {
    assertParse(
      "expression",
      `#!/usr/bin/env ori @invoke
'Hello'
`,
      [ops.primitive, "Hello"],
      false
    );
  });

  test("singleLineComment", () => {
    assertParse("singleLineComment", "// Hello, world!", null, false);
  });

  test("spread", () => {
    assertParse("spread", "...a", [ops.spread, [ops.scope, "a"]]);
    assertParse("spread", "…a", [ops.spread, [ops.scope, "a"]]);
  });

  test("string", () => {
    assertParse("string", '"foo"', [ops.primitive, "foo"]);
    assertParse("string", "'bar'", [ops.primitive, "bar"]);
    assertParse("string", '"foo bar"', [ops.primitive, "foo bar"]);
    assertParse("string", "'bar baz'", [ops.primitive, "bar baz"]);
    assertParse("string", `"foo\\"s bar"`, [ops.primitive, `foo"s bar`]);
    assertParse("string", `'bar\\'s baz'`, [ops.primitive, `bar's baz`]);
    assertParse("string", `«string»`, [ops.primitive, "string"]);
    assertParse("string", `"\\0\\b\\f\\n\\r\\t\\v"`, [
      ops.primitive,
      "\0\b\f\n\r\t\v",
    ]);
  });

  test("templateDocument", () => {
    assertParse("templateDocument", "hello${foo}world", [
      ops.lambda,
      null,
      [
        ops.concat,
        [ops.primitive, "hello"],
        [ops.scope, "foo"],
        [ops.primitive, "world"],
      ],
    ]);
    assertParse("templateDocument", "Documents can contain ` backticks", [
      ops.lambda,
      null,
      [ops.primitive, "Documents can contain ` backticks"],
    ]);
  });

  test("templateLiteral", () => {
    assertParse("templateLiteral", "`Hello, world.`", [
      ops.primitive,
      "Hello, world.",
    ]);
    assertParse("templateLiteral", "`foo ${x} bar`", [
      ops.concat,
      [ops.primitive, "foo "],
      [ops.scope, "x"],
      [ops.primitive, " bar"],
    ]);
    assertParse("templateLiteral", "`${`nested`}`", [ops.primitive, "nested"]);
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
    assertParse("templateLiteral", "`Hello, world.`", [
      ops.primitive,
      "Hello, world.",
    ]);
    assertParse("templateLiteral", "`foo ${x} bar`", [
      ops.concat,
      [ops.primitive, "foo "],
      [ops.scope, "x"],
      [ops.primitive, " bar"],
    ]);
    assertParse("templateLiteral", "`${`nested`}`", [ops.primitive, "nested"]);
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
      null,
      false
    );
  });
});

function assertParse(startRule, source, expected, checkLocation = true) {
  const code = parse(source, {
    grammarSource: { text: source },
    startRule,
  });

  // Verify that the parser returned a `location` property and that it spans the
  // entire source. We skip this check in cases where the source starts or ends
  // with a comment; the parser will strip those.
  if (checkLocation) {
    assert(code.location);
    const resultSource = code.location.source.text.slice(
      code.location.start.offset,
      code.location.end.offset
    );
    assert.equal(resultSource, source.trim());
  }

  const actual = stripLocations(code);
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
