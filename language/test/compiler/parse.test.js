import assert from "node:assert";
import { describe, test } from "node:test";
import { parse } from "../../src/compiler/parse.js";
import * as ops from "../../src/runtime/ops.js";
import { stripCodeLocations } from "./stripCodeLocations.js";

describe("Origami parser", () => {
  test("absoluteFilePath", () => {
    assertParse("absoluteFilePath", "/foo/bar", [
      [ops.filesRoot],
      [ops.literal, "foo/"],
      [ops.literal, "bar"],
    ]);
  });

  test("array", () => {
    assertParse("array", "[]", [ops.array]);
    assertParse("array", "[1, 2, 3]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, 2],
      [ops.literal, 3],
    ]);
    assertParse("array", "[ 1 , 2 , 3 ]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, 2],
      [ops.literal, 3],
    ]);
    assertParse("array", "[ 1, ...[2, 3]]", [
      ops.merge,
      [ops.array, [ops.literal, 1]],
      [ops.array, [ops.literal, 2], [ops.literal, 3]],
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
      [ops.literal, "hello"],
      [ops.literal, "world"],
    ]);
    assertParse("expr", "(fn)('a')", [
      [ops.scope, "fn"],
      [ops.literal, "a"],
    ]);
    assertParse("expr", "1", [ops.literal, 1]);
    assertParse("expr", "{ a: 1, b: 2 }", [
      ops.object,
      ["a", [ops.literal, 1]],
      ["b", [ops.literal, 2]],
    ]);
    assertParse("expr", "serve { index.html: 'hello' }", [
      [ops.scope, "serve"],
      [ops.object, ["index.html", [ops.literal, "hello"]]],
    ]);
    assertParse("expr", "fn =`x`", [
      [ops.scope, "fn"],
      [ops.lambda, ["_"], [ops.template, [ops.literal, ["x"]]]],
    ]);
    assertParse("expr", "copy app(formulas), files 'snapshot'", [
      [ops.scope, "copy"],
      [
        [ops.scope, "app"],
        [ops.scope, "formulas"],
      ],
      [
        [ops.scope, "files"],
        [ops.literal, "snapshot"],
      ],
    ]);
    assertParse("expr", "@map =`<li>${_}</li>`", [
      [ops.scope, "@map"],
      [
        ops.lambda,
        ["_"],
        [
          ops.template,
          [ops.literal, ["<li>", "</li>"]],
          [ops.concat, [ops.scope, "_"]],
        ],
      ],
    ]);
    assertParse("expr", `"https://example.com"`, [
      ops.literal,
      "https://example.com",
    ]);
    assertParse("expr", "'Hello' -> test.orit", [
      [ops.scope, "test.orit"],
      [ops.literal, "Hello"],
    ]);
    assertParse("expr", "tag`Hello, ${name}!`", [
      [ops.scope, "tag"],
      [ops.literal, ["Hello, ", "!"]],
      [ops.concat, [ops.scope, "name"]],
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
      [ops.literal, "key"],
    ]);
    // Single slash at start of something = absolute file path
    assertParse("expression", "/path", [
      [ops.filesRoot],
      [ops.literal, "path"],
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
      [ops.literal, "key"],
    ]);
    assertParse("functionComposition", "tree/key()", [
      [ops.traverse, [ops.scope, "tree/"], [ops.literal, "key"]],
      undefined,
    ]);
    assertParse("functionComposition", "(tree)/", [
      ops.unpack,
      [ops.scope, "tree"],
    ]);
    assertParse("functionComposition", "fn()/key()", [
      [ops.traverse, [[ops.scope, "fn"], undefined], [ops.literal, "key"]],
      undefined,
    ]);
    assertParse("functionComposition", "(fn())('arg')", [
      [[ops.scope, "fn"], undefined],
      [ops.literal, "arg"],
    ]);
    assertParse("functionComposition", "fn('a')('b')", [
      [
        [ops.scope, "fn"],
        [ops.literal, "a"],
      ],
      [ops.literal, "b"],
    ]);
    assertParse("functionComposition", "(fn())(a, b)", [
      [[ops.scope, "fn"], undefined],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("functionComposition", "{ a: 1, b: 2}/b", [
      ops.traverse,
      [ops.object, ["a", [ops.literal, 1]], ["b", [ops.literal, 2]]],
      [ops.literal, "b"],
    ]);
    assertParse("functionComposition", "fn arg", [
      [ops.scope, "fn"],
      [ops.scope, "arg"],
    ]);
    assertParse("functionComposition", "fn 'a', 'b'", [
      [ops.scope, "fn"],
      [ops.literal, "a"],
      [ops.literal, "b"],
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
        [ops.literal, "arg"],
      ],
    ]);
    assertParse("functionComposition", "(fn()) 'arg'", [
      [[ops.scope, "fn"], undefined],
      [ops.literal, "arg"],
    ]);
    assertParse("functionComposition", "tree/key arg", [
      [ops.traverse, [ops.scope, "tree/"], [ops.literal, "key"]],
      [ops.scope, "arg"],
    ]);
    assertParse("functionComposition", "https://example.com/tree.yaml 'key'", [
      [ops.https, [ops.literal, "example.com"], [ops.literal, "tree.yaml"]],
      [ops.literal, "key"],
    ]);
  });

  test("group", () => {
    assertParse("group", "(hello)", [ops.scope, "hello"]);
    assertParse("group", "(((nested)))", [ops.scope, "nested"]);
    assertParse("group", "(fn())", [[ops.scope, "fn"], undefined]);
  });

  test("host", () => {
    assertParse("host", "abc", [ops.literal, "abc"]);
    assertParse("host", "abc:123", [ops.literal, "abc:123"]);
    assertParse("host", "foo\\ bar", [ops.literal, "foo bar"]);
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
      ["_"],
      [ops.scope, "message"],
    ]);
    assertParse("lambda", "=`Hello, ${name}.`", [
      ops.lambda,
      ["_"],
      [
        ops.template,
        [ops.literal, ["Hello, ", "."]],
        [ops.concat, [ops.scope, "name"]],
      ],
    ]);
  });

  test("leadingSlashPath", () => {
    assertParse("leadingSlashPath", "/", []);
    assertParse("leadingSlashPath", "/tree", [[ops.literal, "tree"]]);
    assertParse("leadingSlashPath", "/tree/", [[ops.literal, "tree/"]]);
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

  test("multiLineComment", () => {
    assertParse("multiLineComment", "/*\nHello, world!\n*/", null, false);
  });

  test("new", () => {
    assertParse("expression", "new:@js/Date('2025-01-01')", [
      [ops.constructor, [ops.literal, "@js"], [ops.literal, "Date"]],
      [ops.literal, "2025-01-01"],
    ]);
  });

  test("number", () => {
    assertParse("number", "123", [ops.literal, 123]);
    assertParse("number", "-456", [ops.literal, -456]);
    assertParse("number", ".5", [ops.literal, 0.5]);
    assertParse("number", "123.45", [ops.literal, 123.45]);
    assertParse("number", "-678.90", [ops.literal, -678.9]);
    assertParse("number", "+123", [ops.literal, 123]);
    assertParse("number", "+456.78", [ops.literal, 456.78]);
  });

  test("object", () => {
    assertParse("object", "{}", [ops.object]);
    assertParse("object", "{ a: 1, b }", [
      ops.object,
      ["a", [ops.literal, 1]],
      ["b", [ops.inherited, "b"]],
    ]);
    assertParse("object", "{ sub: { a: 1 } }", [
      ops.object,
      ["sub", [ops.object, ["a", [ops.literal, 1]]]],
    ]);
    assertParse("object", "{ sub: { a/: 1 } }", [
      ops.object,
      ["sub", [ops.object, ["a/", [ops.literal, 1]]]],
    ]);
    assertParse("object", `{ "a": 1, "b": 2 }`, [
      ops.object,
      ["a", [ops.literal, 1]],
      ["b", [ops.literal, 2]],
    ]);
    assertParse("object", "{ a = b, b = 2 }", [
      ops.object,
      ["a", [ops.getter, [ops.scope, "b"]]],
      ["b", [ops.literal, 2]],
    ]);
    assertParse("object", "{ a: { b: 1 } }", [
      ops.object,
      ["a", [ops.object, ["b", [ops.literal, 1]]]],
    ]);
    assertParse("object", "{ a: { b = 1 } }", [
      ops.object,
      ["a", [ops.object, ["b", [ops.literal, 1]]]],
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
            [ops.literal, "a"],
          ],
        ],
      ],
    ]);
    assertParse("object", "{ a: 1, ...b }", [
      ops.merge,
      [ops.object, ["a", [ops.literal, 1]]],
      [ops.scope, "b"],
    ]);
    assertParse("object", "{ (a): 1 }", [
      ops.object,
      ["(a)", [ops.literal, 1]],
    ]);
  });

  test("objectEntry", () => {
    assertParse("objectEntry", "foo", ["foo", [ops.inherited, "foo"]]);
    assertParse("objectEntry", "x: y", ["x", [ops.scope, "y"]]);
    assertParse("objectEntry", "a: a", ["a", [ops.inherited, "a"]]);
    assertParse("objectEntry", "posts/: @map(posts, post.ori)", [
      "posts/",
      [
        [ops.scope, "@map"],
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
    assertParse("objectGetter", "foo = fn 'bar'", [
      "foo",
      [
        ops.getter,
        [
          [ops.scope, "fn"],
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
        [ops.scope, "fn"],
        [ops.literal, "a"],
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
    assertParse("path", "tree/", [[ops.literal, "tree/"]]);
    assertParse("path", "month/12", [
      [ops.literal, "month/"],
      [ops.literal, "12"],
    ]);
    assertParse("path", "tree/foo/bar", [
      [ops.literal, "tree/"],
      [ops.literal, "foo/"],
      [ops.literal, "bar"],
    ]);
    assertParse("path", "a///b", [
      [ops.literal, "a/"],
      [ops.literal, "b"],
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
      [ops.literal, "bar"],
    ]);
    assertParse("protocolCall", "https://example.com/foo/", [
      ops.https,
      [ops.literal, "example.com"],
      [ops.literal, "foo/"],
    ]);
    assertParse("protocolCall", "http:example.com", [
      ops.http,
      [ops.literal, "example.com"],
    ]);
    assertParse("protocolCall", "http://localhost:5000/foo", [
      ops.http,
      [ops.literal, "localhost:5000"],
      [ops.literal, "foo"],
    ]);
  });

  test("scopeReference", () => {
    assertParse("scopeReference", "x", [ops.scope, "x"]);
  });

  test("scopeTraverse", () => {
    assertParse("scopeTraverse", "tree/", [ops.traverse, [ops.scope, "tree/"]]);
    assertParse("scopeTraverse", "tree/foo/bar", [
      ops.traverse,
      [ops.scope, "tree/"],
      [ops.literal, "foo/"],
      [ops.literal, "bar"],
    ]);
    assertParse("scopeTraverse", "tree/foo/bar/", [
      ops.traverse,
      [ops.scope, "tree/"],
      [ops.literal, "foo/"],
      [ops.literal, "bar/"],
    ]);
  });

  test("shebang", () => {
    assertParse(
      "expression",
      `#!/usr/bin/env ori @invoke
'Hello'
`,
      [ops.literal, "Hello"],
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
    assertParse("string", '"foo"', [ops.literal, "foo"]);
    assertParse("string", "'bar'", [ops.literal, "bar"]);
    assertParse("string", '"foo bar"', [ops.literal, "foo bar"]);
    assertParse("string", "'bar baz'", [ops.literal, "bar baz"]);
    assertParse("string", `"foo\\"s bar"`, [ops.literal, `foo"s bar`]);
    assertParse("string", `'bar\\'s baz'`, [ops.literal, `bar's baz`]);
    assertParse("string", `«string»`, [ops.literal, "string"]);
    assertParse("string", `"\\0\\b\\f\\n\\r\\t\\v"`, [
      ops.literal,
      "\0\b\f\n\r\t\v",
    ]);
  });

  test("taggedTemplate", () => {
    assertParse("taggedTemplate", "tag`Hello, world.`", [
      [ops.scope, "tag"],
      [ops.literal, ["Hello, world."]],
    ]);
  });

  test("templateDocument", () => {
    assertParse("templateDocument", "hello${foo}world", [
      ops.lambda,
      ["_"],
      [
        ops.template,
        [ops.literal, ["hello", "world"]],
        [ops.concat, [ops.scope, "foo"]],
      ],
    ]);
    assertParse("templateDocument", "Documents can contain ` backticks", [
      ops.lambda,
      ["_"],
      [ops.template, [ops.literal, ["Documents can contain ` backticks"]]],
    ]);
  });

  test("templateLiteral", () => {
    assertParse("templateLiteral", "`Hello, world.`", [
      ops.template,
      [ops.literal, ["Hello, world."]],
    ]);
    assertParse("templateLiteral", "`foo ${x} bar`", [
      ops.template,
      [ops.literal, ["foo ", " bar"]],
      [ops.concat, [ops.scope, "x"]],
    ]);
    assertParse("templateLiteral", "`${`nested`}`", [
      ops.template,
      [ops.literal, ["", ""]],
      [ops.concat, [ops.template, [ops.literal, ["nested"]]]],
    ]);
    assertParse("templateLiteral", "`${map(people, =`${name}`)}`", [
      ops.template,
      [ops.literal, ["", ""]],
      [
        ops.concat,
        [
          [ops.scope, "map"],
          [ops.scope, "people"],
          [
            ops.lambda,
            ["_"],
            [
              ops.template,
              [ops.literal, ["", ""]],
              [ops.concat, [ops.scope, "name"]],
            ],
          ],
        ],
      ],
    ]);
  });

  test("templateSubtitution", () => {
    assertParse("templateSubstitution", "${foo}", [ops.scope, "foo"], false);
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

  const actual = stripCodeLocations(code);
  assert.deepEqual(actual, expected);
}
