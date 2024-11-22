import assert from "node:assert";
import { describe, test } from "node:test";
import { parse } from "../../src/compiler/parse.js";
import * as ops from "../../src/runtime/ops.js";
import { stripCodeLocations } from "./stripCodeLocations.js";

describe.only("Origami parser", () => {
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
    assertParse(
      "array",
      `[
        1
        2
        3
      ]`,
      [ops.array, [ops.literal, 1], [ops.literal, 2], [ops.literal, 3]]
    );
  });

  test("call", () => {
    assertParse("call", "fn()", [[ops.builtin, "fn"], undefined]);
    assertParse("call", "foo.js(arg)", [
      [ops.scope, "foo.js"],
      [ops.scope, "arg"],
    ]);
    assertParse("call", "fn(a, b)", [
      [ops.builtin, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("call", "foo.js( a , b )", [
      [ops.scope, "foo.js"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("call", "fn()(arg)", [
      [[ops.builtin, "fn"], undefined],
      [ops.scope, "arg"],
    ]);
    assertParse("call", "tree/", [
      ops.unpack,
      // TODO: Should be `tree/`
      [ops.scope, "tree"],
    ]);
    assertParse("call", "tree/foo/bar", [
      ops.traverse,
      // TODO: Should be `tree/`
      [ops.scope, "tree"],
      [ops.literal, "foo/"],
      [ops.literal, "bar"],
    ]);
    assertParse("call", "tree/foo/bar/", [
      ops.traverse,
      // TODO: Should be `tree/`
      [ops.scope, "tree"],
      [ops.literal, "foo/"],
      [ops.literal, "bar/"],
    ]);
    assertParse("call", "/foo/bar", [
      ops.traverse,
      // TODO: Should be `foo/`
      [ops.rootDirectory, [ops.literal, "foo"]],
      [ops.literal, "bar"],
    ]);
    assertParse("call", "foo.js()/key", [
      ops.traverse,
      [[ops.scope, "foo.js"], undefined],
      [ops.literal, "key"],
    ]);
    assertParse("call", "tree/key()", [
      // TODO: "tree" should be "tree/"
      [ops.traverse, [ops.scope, "tree"], [ops.literal, "key"]],
      undefined,
    ]);
    assertParse("call", "(tree)/", [ops.unpack, [ops.scope, "tree"]]);
    assertParse("call", "fn()/key()", [
      [ops.traverse, [[ops.builtin, "fn"], undefined], [ops.literal, "key"]],
      undefined,
    ]);
    assertParse("call", "(foo.js())('arg')", [
      [[ops.scope, "foo.js"], undefined],
      [ops.literal, "arg"],
    ]);
    assertParse("call", "fn('a')('b')", [
      [
        [ops.builtin, "fn"],
        [ops.literal, "a"],
      ],
      [ops.literal, "b"],
    ]);
    assertParse("call", "(foo.js())(a, b)", [
      [[ops.scope, "foo.js"], undefined],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse("call", "{ a: 1, b: 2}/b", [
      ops.traverse,
      [ops.object, ["a", [ops.literal, 1]], ["b", [ops.literal, 2]]],
      [ops.literal, "b"],
    ]);
    assertParse("call", "fn arg", [
      [ops.builtin, "fn"],
      [ops.scope, "arg"],
    ]);
    assertParse("call", "page.ori 'a', 'b'", [
      [ops.scope, "page.ori"],
      [ops.literal, "a"],
      [ops.literal, "b"],
    ]);
    assertParse("call", "fn a(b), c", [
      [ops.builtin, "fn"],
      [
        [ops.builtin, "a"],
        [ops.scope, "b"],
      ],
      [ops.scope, "c"],
    ]);
    assertParse("call", "foo.js bar.ori 'arg'", [
      [ops.scope, "foo.js"],
      [
        [ops.scope, "bar.ori"],
        [ops.literal, "arg"],
      ],
    ]);
    assertParse("call", "(fn()) 'arg'", [
      [[ops.builtin, "fn"], undefined],
      [ops.literal, "arg"],
    ]);
    assertParse("call", "tree/key arg", [
      // TODO: "tree" should be "tree/"
      [ops.traverse, [ops.scope, "tree"], [ops.literal, "key"]],
      [ops.scope, "arg"],
    ]);
    assertParse("call", "files:src/assets", [
      ops.traverse,
      [
        [ops.builtin, "files:"],
        // TODO: This should be `src/`
        [ops.literal, "src"],
      ],
      [ops.literal, "assets"],
    ]);
    assertParse("call", "new:(js:Date, '2025-01-01')", [
      [ops.builtin, "new:"],
      [
        [ops.builtin, "js:"],
        [ops.literal, "Date"],
      ],
      [ops.literal, "2025-01-01"],
    ]);
    assertParse("call", "map(markdown, mdHtml)", [
      [ops.builtin, "map"],
      [ops.scope, "markdown"],
      [ops.scope, "mdHtml"],
    ]);
    assertParse("call", "package:@weborigami/dropbox/auth(creds)", [
      [
        ops.traverse,
        [
          [ops.builtin, "package:"],
          // TODO: This should be `@weborigami/`
          [ops.literal, "@weborigami"],
        ],
        [ops.literal, "dropbox/"],
        [ops.literal, "auth"],
      ],
      [ops.scope, "creds"],
    ]);
  });

  test("callTarget", () => {
    assertParse("callTarget", "foo", [ops.builtin, "foo"]);
    assertParse("callTarget", "foo.js", [ops.scope, "foo.js"]);
    assertParse("callTarget", "[1, 2]", [
      ops.array,
      [ops.literal, 1],
      [ops.literal, 2],
    ]);
  });

  test("expression", () => {
    assertParse(
      "expression",
      `
        {
          index.html = index.ori(teamData.yaml)
          thumbnails = map(images, { value: thumbnail.js })
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
      // TODO: Should be `path/`
      [ops.scope, "path"],
      [ops.literal, "key"],
    ]);

    // Single slash at start of something = absolute file path
    assertParse("expression", "/path", [
      ops.rootDirectory,
      [ops.literal, "path"],
    ]);

    // Consecutive slashes at start of something = comment
    assertParse("expression", "path //comment", [ops.scope, "path"], false);
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
  });

  test("functionReference", () => {
    assertParse("functionReference", "json", [ops.builtin, "json"]);
    assertParse("functionReference", "greet.js", [ops.scope, "greet.js"]);
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
    assertParse("host", "example.com/", [ops.literal, "example.com/"]);
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
    assertParse("lambda", "=indent`hello`", [
      ops.lambda,
      ["_"],
      [
        [ops.builtin, "indent"],
        [ops.literal, ["hello"]],
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

  test("multiLineComment", () => {
    assertParse("multiLineComment", "/*\nHello, world!\n*/", null, false);
  });

  test("namespace", () => {
    assertParse("namespace", "js:", [ops.builtin, "js:"]);
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
    assertParse(
      "object",
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
      [
        "a/",
        [ops.object, ["b", [ops.getter, [[ops.builtin, "fn"], undefined]]]],
      ],
    ]);
    assertParse("object", "{ x = fn.js('a') }", [
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
    assertParse("objectEntry", "a: (a) => a", [
      "a",
      [ops.lambda, ["a"], [ops.scope, "a"]],
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
        [ops.builtin, "fn"],
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
          [ops.builtin, "fn"],
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
    assertParse("pipeline", "foo", [ops.scope, "foo"]);
    assertParse("pipeline", "a -> b", [
      [ops.builtin, "b"],
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
      [ops.builtin, "b"],
      [
        [ops.builtin, "fn"],
        [ops.scope, "a"],
      ],
    ]);
  });

  test("pipelineStep", () => {
    assertParse("pipelineStep", "foo", [ops.builtin, "foo"]);
    assertParse("pipelineStep", "=_", [ops.lambda, ["_"], [ops.scope, "_"]]);
  });

  test("program", () => {
    assertParse(
      "program",
      `#!/usr/bin/env ori invoke
'Hello'
`,
      [ops.literal, "Hello"],
      false
    );
  });

  test("protocolPath", () => {
    assertParse("protocolPath", "foo://bar", [
      [ops.builtin, "foo:"],
      [ops.literal, "bar"],
    ]);
    assertParse("protocolPath", "http://example.com", [
      [ops.builtin, "http:"],
      [ops.literal, "example.com"],
    ]);
    assertParse("protocolPath", "https://example.com/about/", [
      [ops.builtin, "https:"],
      [ops.literal, "example.com/"],
      [ops.literal, "about/"],
    ]);
    assertParse("protocolPath", "https://example.com/about/index.html", [
      [ops.builtin, "https:"],
      [ops.literal, "example.com/"],
      [ops.literal, "about/"],
      [ops.literal, "index.html"],
    ]);
    assertParse("protocolPath", "http://localhost:5000/foo", [
      [ops.builtin, "http:"],
      [ops.literal, "localhost:5000/"],
      [ops.literal, "foo"],
    ]);
  });

  test("qualifiedReference", () => {
    assertParse("qualifiedReference", "js:Date", [
      [ops.builtin, "js:"],
      [ops.literal, "Date"],
    ]);
  });

  test("rootDirectory", () => {
    assertParse("rootDirectory", "/", [ops.rootDirectory]);
  });

  test("scopeReference", () => {
    assertParse("scopeReference", "x", [ops.scope, "x"]);
  });

  test("singleLineComment", () => {
    assertParse("singleLineComment", "// Hello, world!", null, false);
  });

  test("slashArgs", () => {
    assertParse("slashArgs", "/", [ops.traverse]);
    assertParse("slashArgs", "/tree", [ops.traverse, [ops.literal, "tree"]]);
    assertParse("slashArgs", "/tree/", [ops.traverse, [ops.literal, "tree/"]]);
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
    assertParse("taggedTemplate", "indent`hello`", [
      [ops.builtin, "indent"],
      [ops.literal, ["hello"]],
    ]);
    assertParse("taggedTemplate", "fn.js`Hello, world.`", [
      [ops.scope, "fn.js"],
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
    assertParse("templateLiteral", "`${ map:(people, =`${name}`) }`", [
      ops.template,
      [ops.literal, ["", ""]],
      [
        ops.concat,
        [
          [ops.builtin, "map:"],
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

  test("value", () => {
    assertParse("value", "obj.json", [ops.scope, "obj.json"]);
    assertParse("value", "(fn a, b, c)", [
      [ops.builtin, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse("value", "foo.bar('hello', 'world')", [
      [ops.scope, "foo.bar"],
      [ops.literal, "hello"],
      [ops.literal, "world"],
    ]);
    assertParse("value", "(key)('a')", [
      [ops.scope, "key"],
      [ops.literal, "a"],
    ]);
    assertParse("value", "1", [ops.literal, 1]);
    assertParse("value", "{ a: 1, b: 2 }", [
      ops.object,
      ["a", [ops.literal, 1]],
      ["b", [ops.literal, 2]],
    ]);
    assertParse("value", "serve { index.html: 'hello' }", [
      [ops.builtin, "serve"],
      [ops.object, ["index.html", [ops.literal, "hello"]]],
    ]);
    assertParse("value", "fn =`x`", [
      [ops.builtin, "fn"],
      [ops.lambda, ["_"], [ops.template, [ops.literal, ["x"]]]],
    ]);
    assertParse("value", "copy app.js(formulas), files:snapshot", [
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
    assertParse("value", "map =`<li>${_}</li>`", [
      [ops.builtin, "map"],
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
    assertParse("value", `"https://example.com"`, [
      ops.literal,
      "https://example.com",
    ]);
    assertParse("value", "tag`Hello, ${name}!`", [
      [ops.builtin, "tag"],
      [ops.literal, ["Hello, ", "!"]],
      [ops.concat, [ops.scope, "name"]],
    ]);
    assertParse("value", "(post, slug) => fn.js(post, slug)", [
      ops.lambda,
      ["post", "slug"],
      [
        [ops.scope, "fn.js"],
        [ops.scope, "post"],
        [ops.scope, "slug"],
      ],
    ]);
  });

  // Calc work
  describe("calc", () => {
    test("conditional", () => {
      assertParse("conditional", "true ? 1 : 0", [
        ops.conditional,
        [ops.scope, "true"],
        [ops.lambda, [], [ops.literal, "1"]],
        [ops.lambda, [], [ops.literal, "0"]],
      ]);
      assertParse("conditional", "1", [ops.literal, 1]);
    });

    test("logicalAnd", () => {
      assertParse("logicalAnd", "true && false", [
        ops.logicalAnd,
        [ops.scope, "true"],
        [ops.lambda, [], [ops.scope, "false"]],
      ]);
    });

    test("logicalOr", () => {
      assertParse("logicalOr", "1 || 0", [
        ops.logicalOr,
        [ops.literal, 1],
        [ops.literal, 0],
      ]);
      assertParse("logicalOr", "false || false || true", [
        ops.logicalOr,
        [ops.scope, "false"],
        [ops.lambda, [], [ops.scope, "false"]],
        [ops.lambda, [], [ops.scope, "true"]],
      ]);
      assertParse("logicalOr", "1 || 2 && 0", [
        ops.logicalOr,
        [ops.literal, 1],
        [ops.lambda, [], [ops.logicalAnd, [ops.literal, 2], [ops.literal, 0]]],
      ]);
    });

    test("nullishCoalescing", () => {
      assertParse("nullishCoalescing", "a ?? b", [
        ops.nullishCoalescing,
        [ops.scope, "a"],
        [ops.lambda, [], [ops.scope, "b"]],
      ]);
      assertParse("nullishCoalescing", "a ?? b ?? c", [
        ops.nullishCoalescing,
        [ops.scope, "a"],
        [ops.lambda, [], [ops.scope, "b"]],
        [ops.lambda, [], [ops.scope, "c"]],
      ]);
    });

    test("equality", () => {
      assertParse("equality", "1 === 1", [
        ops.strictEqual,
        [ops.literal, 1],
        [ops.literal, 1],
      ]);
      assertParse("equality", "a === b === c", [
        ops.strictEqual,
        [ops.strictEqual, [ops.scope, "a"], [ops.scope, "b"]],
        [ops.scope, "c"],
      ]);
      assertParse("equality", "1 !== 1", [
        ops.notStrictEqual,
        [ops.literal, 1],
        [ops.literal, 1],
      ]);
    });
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
    assert(code.location, "no location");
    const resultSource = code.location.source.text.slice(
      code.location.start.offset,
      code.location.end.offset
    );
    assert.equal(resultSource, source.trim());
  }

  const actual = stripCodeLocations(code);
  assert.deepEqual(actual, expected);
}
