import assert from "node:assert";
import { describe, test } from "node:test";
import { tokenType } from "../../src/language/lex.js";
import * as ops from "../../src/language/ops.js";
import {
  absoluteFilePath,
  array,
  assignment,
  expression,
  functionComposition,
  graph,
  graphDocument,
  group,
  implicitParensCall,
  lambda,
  list,
  number,
  object,
  objectProperty,
  objectPropertyOrShorthand,
  parensArgs,
  pathKey,
  protocolCall,
  scopeReference,
  slashPath,
  string,
  substitution,
  templateDocument,
  templateLiteral,
} from "../../src/language/parse.js";

describe("parse", () => {
  describe("absoluteFilePath", () => {
    test("/foo/bar", () => {
      assertParse(
        absoluteFilePath([
          { type: tokenType.SLASH, lexeme: "/" },
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.SLASH, lexeme: "/" },
          { type: tokenType.REFERENCE, lexeme: "bar" },
        ]),
        [[ops.filesRoot], "foo", "bar"]
      );
    });
  });

  describe("array", () => {
    test("[]", () => {
      assertParse(
        array([
          { type: tokenType.LEFT_BRACKET },
          { type: tokenType.RIGHT_BRACKET },
        ]),
        [ops.array]
      );
    });

    test("[1, 2, 3]", () => {
      assertParse(
        array([
          { type: tokenType.LEFT_BRACKET },
          { type: tokenType.NUMBER, lexeme: "1" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.NUMBER, lexeme: "2" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.NUMBER, lexeme: "3" },
          { type: tokenType.RIGHT_BRACKET },
        ]),
        [ops.array, 1, 2, 3]
      );
    });

    // Unmatched bracket
    test("[1", () => {
      assert.throws(() =>
        array([
          { type: tokenType.LEFT_BRACKET },
          { type: tokenType.NUMBER, lexeme: "1" },
        ])
      );
    });
  });

  describe("assignment", () => {
    test("data = obj.json", () => {
      assertParse(
        assignment([
          {
            type: tokenType.REFERENCE,
            lexeme: "data",
          },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.EQUALS },
          { type: tokenType.REFERENCE, lexeme: "obj.json" },
        ]),
        [ops.assign, "data", [ops.scope, "obj.json"]]
      );
    });

    test("foo = fn 'bar'", () => {
      assertParse(
        assignment([
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.EQUALS },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.STRING, lexeme: "bar" },
        ]),
        [ops.assign, "foo", [[ops.scope, "fn"], "bar"]]
      );
    });
  });

  describe("expression", () => {
    test("obj.json", () => {
      assertParse(
        expression([{ type: tokenType.REFERENCE, lexeme: "obj.json" }]),
        [ops.scope, "obj.json"]
      );
    });

    test("(fn a, b, c)", () => {
      assertParse(
        expression([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "b" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "c" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [
          [ops.scope, "fn"],
          [ops.scope, "a"],
          [ops.scope, "b"],
          [ops.scope, "c"],
        ]
      );
    });

    test("foo.bar('hello', 'world')", () => {
      assertParse(
        expression([
          { type: tokenType.REFERENCE, lexeme: "foo.bar" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.STRING, lexeme: "hello" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.STRING, lexeme: "world" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [[ops.scope, "foo.bar"], "hello", "world"]
      );
    });

    test("(fn)('a')", () => {
      assertParse(
        expression([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.STRING, lexeme: "a" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [[ops.scope, "fn"], "a"]
      );
    });

    test("1", () => {
      assertParse(expression([{ type: tokenType.NUMBER, lexeme: "1" }]), 1);
    });

    test("(foo", () => {
      assert.equal(
        expression([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "foo" },
        ]),
        null
      );
    });

    test("{ a: 1, b: 2 }", () => {
      assertParse(
        expression([
          { type: tokenType.LEFT_BRACE },
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.COLON },
          { type: tokenType.NUMBER, lexeme: "1" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "b" },
          { type: tokenType.COLON },
          { type: tokenType.NUMBER, lexeme: "2" },
          { type: tokenType.RIGHT_BRACE },
        ]),
        [ops.object, { a: 1, b: 2 }]
      );
    });

    test("serve { index.html: 'hello' }", () => {
      assertParse(
        expression([
          { type: tokenType.REFERENCE, lexeme: "serve" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.LEFT_BRACE },
          { type: tokenType.REFERENCE, lexeme: "index.html" },
          { type: tokenType.COLON },
          { type: tokenType.STRING, lexeme: "hello" },
          { type: tokenType.RIGHT_BRACE },
        ]),
        [
          [ops.scope, "serve"],
          [ops.object, { "index.html": "hello" }],
        ]
      );
    });

    test("fn =`x`", () => {
      assertParse(
        expression([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.EQUALS },
          { type: tokenType.BACKTICK },
          { type: tokenType.STRING, lexeme: "x" },
          { type: tokenType.BACKTICK },
        ]),
        [
          [ops.scope, "fn"],
          [ops.lambda, "x"],
        ]
      );
    });

    test("copy app(formulas), files 'snapshot'", () => {
      assertParse(
        expression([
          { type: tokenType.REFERENCE, lexeme: "copy" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.REFERENCE, lexeme: "app" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "formulas" },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "files" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.STRING, lexeme: "snapshot" },
        ]),
        [
          [ops.scope, "copy"],
          [
            [ops.scope, "app"],
            [ops.scope, "formulas"],
          ],
          [[ops.scope, "files"], "snapshot"],
        ]
      );
    });

    test("@map/values @input, =`<li>{{@value}}</li>`", () => {
      assertParse(
        expression([
          { type: tokenType.REFERENCE, lexeme: "@map" },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "values" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.REFERENCE, lexeme: "@input" },
          { type: tokenType.SEPARATOR, lexeme: "," },
          { type: tokenType.EQUALS, lexeme: "=" },
          { type: tokenType.BACKTICK, lexeme: "`" },
          { type: tokenType.STRING, lexeme: "<li>" },
          { type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" },
          { type: tokenType.REFERENCE, lexeme: "@value" },
          { type: tokenType.DOUBLE_RIGHT_BRACE, lexeme: "}}" },
          { type: tokenType.STRING, lexeme: "</li>" },
          { type: tokenType.BACKTICK, lexeme: "`" },
        ]),
        [
          [[ops.scope, "@map"], "values"],
          [ops.scope, "@input"],
          [ops.lambda, [ops.concat, "<li>", [ops.scope, "@value"], "</li>"]],
        ]
      );
    });
  });

  describe("functionComposition", () => {
    test("fn()", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [[ops.scope, "fn"]]
      );
    });

    test("fn(arg)", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN, lexeme: "(" },
          { type: tokenType.REFERENCE, lexeme: "arg" },
          { type: tokenType.RIGHT_PAREN, lexeme: ")" },
        ]),
        [
          [ops.scope, "fn"],
          [ops.scope, "arg"],
        ]
      );
    });

    test("fn(a, b)", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.STRING, lexeme: "a" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.STRING, lexeme: "b" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [[ops.scope, "fn"], "a", "b"]
      );
    });

    test("fn()(arg)", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN, lexeme: "(" },
          { type: tokenType.RIGHT_PAREN, lexeme: ")" },
          { type: tokenType.LEFT_PAREN, lexeme: "(" },
          { type: tokenType.REFERENCE, lexeme: "arg" },
          { type: tokenType.RIGHT_PAREN, lexeme: ")" },
        ]),
        [[[ops.scope, "fn"]], [ops.scope, "arg"]]
      );
    });

    test("fn()/key", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN, lexeme: "(" },
          { type: tokenType.RIGHT_PAREN, lexeme: ")" },
          { type: tokenType.SLASH, lexeme: "/" },
          { type: tokenType.REFERENCE, lexeme: "key" },
        ]),
        [[[ops.scope, "fn"]], "key"]
      );
    });

    test("graph/", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "graph" },
          { type: tokenType.SLASH, lexeme: "/" },
        ]),
        [[ops.scope, "graph"], undefined]
      );
    });

    test("graph/key", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "graph" },
          { type: tokenType.SLASH, lexeme: "/" },
          { type: tokenType.REFERENCE, lexeme: "key" },
        ]),
        [[ops.scope, "graph"], "key"]
      );
    });

    test("graph/foo/bar", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "graph" },
          { type: tokenType.SLASH, lexeme: "/" },
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.SLASH, lexeme: "/" },
          { type: tokenType.REFERENCE, lexeme: "bar" },
        ]),
        [[ops.scope, "graph"], "foo", "bar"]
      );
    });

    test("graph/key()", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "graph" },
          { type: tokenType.SLASH, lexeme: "/" },
          { type: tokenType.REFERENCE, lexeme: "key" },
          { type: tokenType.LEFT_PAREN, lexeme: "(" },
          { type: tokenType.RIGHT_PAREN, lexeme: ")" },
        ]),
        [[[ops.scope, "graph"], "key"]]
      );
    });

    test("fn()/key()", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN, lexeme: "(" },
          { type: tokenType.RIGHT_PAREN, lexeme: ")" },
          { type: tokenType.SLASH, lexeme: "/" },
          { type: tokenType.REFERENCE, lexeme: "key" },
          { type: tokenType.LEFT_PAREN, lexeme: "(" },
          { type: tokenType.RIGHT_PAREN, lexeme: ")" },
        ]),
        [[[[ops.scope, "fn"]], "key"]]
      );
    });

    test("(fn())('arg')", () => {
      assertParse(
        functionComposition([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.STRING, lexeme: "arg" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [[[ops.scope, "fn"]], "arg"]
      );
    });

    test("fn('a')('b')", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.STRING, lexeme: "a" },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.STRING, lexeme: "b" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [[[ops.scope, "fn"], "a"], "b"]
      );
    });

    test("(fn())(a, b)", () => {
      assertParse(
        functionComposition([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "b" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [[[ops.scope, "fn"]], [ops.scope, "a"], [ops.scope, "b"]]
      );
    });

    test("{ a: 1, b: 2}/b", () => {
      assertParse(
        functionComposition([
          { type: tokenType.LEFT_BRACE },
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.COLON },
          { type: tokenType.NUMBER, lexeme: "1" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "b" },
          { type: tokenType.COLON },
          { type: tokenType.NUMBER, lexeme: "2" },
          { type: tokenType.RIGHT_BRACE },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "b" },
        ]),
        [[ops.object, { a: 1, b: 2 }], "b"]
      );
    });
  });

  describe("graph", () => {
    test("{}", () => {
      assertParse(
        graph([
          { type: tokenType.LEFT_BRACE },
          { type: tokenType.RIGHT_BRACE },
        ]),
        [ops.graph, {}]
      );
    });

    test("{ x = fn('a') }", () => {
      assertParse(
        graph([
          { type: tokenType.LEFT_BRACE },
          { type: tokenType.REFERENCE, lexeme: "x" },
          { type: tokenType.EQUALS },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.STRING, lexeme: "a" },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.RIGHT_BRACE },
        ]),
        [
          ops.graph,
          {
            x: [[ops.scope, "fn"], "a"],
          },
        ]
      );
    });
  });

  describe("graphDocument", () => {
    test("{}", () => {
      assertParse(graphDocument([]), [ops.graph, {}]);
    });

    test("{ a = 1, b }", () => {
      assertParse(
        graphDocument([
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.EQUALS },
          { type: tokenType.NUMBER, lexeme: "1" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "b" },
        ]),
        [ops.graph, { a: 1, b: [ops.inherited, "b"] }]
      );
    });
  });

  describe("group", () => {
    test("(hello)", () => {
      assertParse(
        group([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "hello" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [ops.scope, "hello"]
      );
    });

    test("(((nested)))", () => {
      assertParse(
        group([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "nested" },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [ops.scope, "nested"]
      );
    });

    test("(fn())", () => {
      assertParse(
        group([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [[ops.scope, "fn"]]
      );
    });

    // Unmatched parenthesis
    test("(", () => {
      assert.equal(group([{ type: tokenType.LEFT_PAREN }]), null);
    });
  });

  describe("implicitParensCall", () => {
    test("fn arg", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.REFERENCE, lexeme: "arg" },
        ]),
        [
          [ops.scope, "fn"],
          [ops.scope, "arg"],
        ]
      );
    });

    test("fn 'a', 'b'", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.STRING, lexeme: "a" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.STRING, lexeme: "b" },
        ]),
        [[ops.scope, "fn"], "a", "b"]
      );
    });

    test("fn a(b), c", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "b" },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "c" },
        ]),
        [
          [ops.scope, "fn"],
          [
            [ops.scope, "a"],
            [ops.scope, "b"],
          ],
          [ops.scope, "c"],
        ]
      );
    });

    test("fn1 fn2 'arg'", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "fn1" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.REFERENCE, lexeme: "fn2" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.STRING, lexeme: "arg" },
        ]),
        [
          [ops.scope, "fn1"],
          [[ops.scope, "fn2"], "arg"],
        ]
      );
    });

    test("(fn()) 'arg'", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.STRING, lexeme: "arg" },
        ]),
        [[[ops.scope, "fn"]], "arg"]
      );
    });

    test("https://example.com/graph.yaml 'key'", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "https" },
          { type: tokenType.COLON },
          { type: tokenType.SLASH },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "example.com" },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "graph.yaml" },
          { type: tokenType.SIGNIFICANT_SPACE, lexeme: " " },
          { type: tokenType.STRING, lexeme: "key" },
        ]),
        [[ops.https, "example.com", "graph.yaml"], "key"]
      );
    });
  });

  describe("lambda", () => {
    test("=message", () => {
      assertParse(
        lambda([
          { type: tokenType.EQUALS },
          { type: tokenType.REFERENCE, lexeme: "message" },
        ]),
        [ops.lambda, [ops.scope, "message"]]
      );
    });

    test("=`Hello, {{name}}.`", () => {
      assertParse(
        lambda([
          { type: tokenType.EQUALS },
          { type: tokenType.BACKTICK },
          { type: tokenType.STRING, lexeme: "Hello, " },
          { type: tokenType.DOUBLE_LEFT_BRACE },
          { type: tokenType.REFERENCE, lexeme: "name" },
          { type: tokenType.DOUBLE_RIGHT_BRACE },
          { type: tokenType.STRING, lexeme: "." },
          { type: tokenType.BACKTICK },
        ]),
        [ops.lambda, [ops.concat, "Hello, ", [ops.scope, "name"], "."]]
      );
    });
  });

  describe("list", () => {
    test("", () => {
      assertParse(list([]), []);
    });

    test("a", () => {
      assertParse(list([{ type: tokenType.REFERENCE, lexeme: "a" }]), [
        [ops.scope, "a"],
      ]);
    });

    test("a, b, c", () => {
      assertParse(
        list([
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "b" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "c" },
        ]),
        [
          [ops.scope, "a"],
          [ops.scope, "b"],
          [ops.scope, "c"],
        ]
      );
    });
  });

  describe("number", () => {
    test("1", () => {
      assertParse(number([{ type: tokenType.NUMBER, lexeme: "1" }]), 1);
    });
  });

  describe("object", () => {
    test("{}", () => {
      assertParse(
        object([
          { type: tokenType.LEFT_BRACE },
          { type: tokenType.RIGHT_BRACE },
        ]),
        [ops.object, {}]
      );
    });

    test("{ a: 1, b }", () => {
      assertParse(
        object([
          { type: tokenType.LEFT_BRACE },
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.COLON },
          { type: tokenType.NUMBER, lexeme: "1" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "b" },
          { type: tokenType.RIGHT_BRACE },
        ]),
        [
          ops.object,
          {
            a: 1,
            b: [ops.inherited, "b"],
          },
        ]
      );
    });
  });

  describe("objectProperty", () => {
    test("{ a: 1 }", () => {
      assertParse(
        objectProperty([
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.COLON },
          { type: tokenType.NUMBER, lexeme: "1" },
        ]),
        { a: 1 }
      );
    });

    test("{ name: 'Alice' }", () => {
      assertParse(
        objectProperty([
          { type: tokenType.REFERENCE, lexeme: "name" },
          { type: tokenType.COLON },
          { type: tokenType.STRING, lexeme: "Alice" },
        ]),
        { name: "Alice" }
      );
    });

    test("x: fn('a')", () => {
      assertParse(
        objectProperty([
          { type: tokenType.REFERENCE, lexeme: "x" },
          { type: tokenType.COLON },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.STRING, lexeme: "a" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        { x: [[ops.scope, "fn"], "a"] }
      );
    });
  });

  describe("objectPropertyOrShorthand", () => {
    test("foo", () => {
      assertParse(
        objectPropertyOrShorthand([
          { type: tokenType.REFERENCE, lexeme: "foo" },
        ]),
        {
          foo: [ops.inherited, "foo"],
        }
      );
    });
  });

  describe("parensArgs", () => {
    test("()", () => {
      assertParse(
        parensArgs([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.RIGHT_PAREN },
        ]),
        []
      );
    });
    test("(a, b, c)", () => {
      assertParse(
        parensArgs([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "b" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "c" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [
          [ops.scope, "a"],
          [ops.scope, "b"],
          [ops.scope, "c"],
        ]
      );
    });
  });

  describe("pathKey", () => {
    // A path key that's a valid number but should be treated as a string
    test("01", () => {
      assertParse(pathKey([{ type: tokenType.NUMBER, lexeme: "01" }]), "01");
    });
  });

  describe("protocolCall", () => {
    test("foo://bar", () => {
      assertParse(
        protocolCall([
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.COLON },
          { type: tokenType.SLASH },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "bar" },
        ]),
        [[ops.scope, "foo"], "bar"]
      );
    });

    test("https://example.com/foo/", () => {
      assertParse(
        protocolCall([
          { type: tokenType.REFERENCE, lexeme: "https" },
          { type: tokenType.COLON },
          { type: tokenType.SLASH },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "example.com" },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.SLASH },
        ]),
        [ops.https, "example.com", "foo", undefined]
      );
    });

    test("http:example.com", () => {
      assertParse(
        protocolCall([
          { type: tokenType.REFERENCE, lexeme: "http" },
          { type: tokenType.COLON },
          { type: tokenType.REFERENCE, lexeme: "example.com" },
        ]),
        [ops.http, "example.com"]
      );
    });

    test("http://localhost:5000/foo", () => {
      assertParse(
        protocolCall([
          { type: tokenType.REFERENCE, lexeme: "http" },
          { type: tokenType.COLON },
          { type: tokenType.SLASH },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "localhost" },
          { type: tokenType.COLON },
          { type: tokenType.NUMBER, lexeme: "5000" },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "foo" },
        ]),
        [ops.http, "localhost:5000", "foo"]
      );
    });
  });

  describe("scopeReference", () => {
    test("hello", () => {
      assertParse(
        scopeReference([{ type: tokenType.REFERENCE, lexeme: "hello" }]),
        [ops.scope, "hello"]
      );
    });
  });

  describe("slashPath", () => {
    test("foo/bar/baz", () => {
      assertParse(
        slashPath([
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "bar" },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "baz" },
        ]),
        ["foo", "bar", "baz"]
      );
    });
    test("foo/", () => {
      assertParse(
        slashPath([
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.SLASH },
        ]),
        ["foo", undefined]
      );
    });
    test("month/12", () => {
      assertParse(
        slashPath([
          { type: tokenType.REFERENCE, lexeme: "month" },
          { type: tokenType.SLASH },
          { type: tokenType.NUMBER, lexeme: "12" },
        ]),
        ["month", "12"]
      );
    });
  });

  describe("string", () => {
    test("Hello", () => {
      assertParse(
        string([{ type: tokenType.STRING, lexeme: "Hello" }]),
        "Hello"
      );
    });
  });

  describe("substitution", () => {
    test("{{foo}}", () => {
      assertParse(
        substitution([
          { type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" },
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.DOUBLE_RIGHT_BRACE, lexeme: "}}" },
        ]),
        [ops.scope, "foo"]
      );
    });
  });

  describe("templateDocument", () => {
    test("hello{{foo}}world", () => {
      assertParse(
        templateDocument([
          { type: tokenType.STRING, lexeme: "hello" },
          { type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" },
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.DOUBLE_RIGHT_BRACE, lexeme: "}}" },
          { type: tokenType.STRING, lexeme: "world" },
        ]),
        [ops.concat, "hello", [ops.scope, "foo"], "world"]
      );
    });
  });

  describe("templateLiteral", () => {
    test("`Hello, world.`", () => {
      assertParse(
        templateLiteral([
          { type: tokenType.BACKTICK },
          { type: tokenType.STRING, lexeme: "Hello, world." },
          { type: tokenType.BACKTICK },
        ]),
        "Hello, world."
      );
    });

    test("`foo {{x}} bar`", () => {
      assertParse(
        templateLiteral([
          { type: tokenType.BACKTICK },
          { type: tokenType.STRING, lexeme: "foo " },
          { type: tokenType.DOUBLE_LEFT_BRACE },
          { type: tokenType.REFERENCE, lexeme: "x" },
          { type: tokenType.DOUBLE_RIGHT_BRACE },
          { type: tokenType.STRING, lexeme: " bar" },
          { type: tokenType.BACKTICK },
        ]),
        [ops.concat, "foo ", [ops.scope, "x"], " bar"]
      );
    });

    test("`{{`nested`}}`", () => {
      assertParse(
        templateLiteral([
          { type: tokenType.BACKTICK },
          { type: tokenType.STRING, lexeme: "" },
          { type: tokenType.DOUBLE_LEFT_BRACE },
          { type: tokenType.BACKTICK },
          { type: tokenType.STRING, lexeme: "nested" },
          { type: tokenType.BACKTICK },
          { type: tokenType.DOUBLE_RIGHT_BRACE },
          { type: tokenType.STRING, lexeme: "" },
          { type: tokenType.BACKTICK },
        ]),
        "nested"
      );
    });

    test("`{{map(people, =`{{name}}`)}}`", () => {
      assertParse(
        templateLiteral([
          { type: tokenType.BACKTICK },
          { type: tokenType.STRING, lexeme: "" },
          { type: tokenType.DOUBLE_LEFT_BRACE },
          { type: tokenType.REFERENCE, lexeme: "map" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "people" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.EQUALS },
          { type: tokenType.BACKTICK },
          { type: tokenType.STRING, lexeme: "" },
          { type: tokenType.DOUBLE_LEFT_BRACE },
          { type: tokenType.REFERENCE, lexeme: "name" },
          { type: tokenType.DOUBLE_RIGHT_BRACE },
          { type: tokenType.STRING, lexeme: "" },
          { type: tokenType.BACKTICK },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.DOUBLE_RIGHT_BRACE },
          { type: tokenType.STRING, lexeme: "" },
          { type: tokenType.BACKTICK },
        ]),
        [
          ops.concat,
          [
            [ops.scope, "map"],
            [ops.scope, "people"],
            [ops.lambda, [ops.concat, [ops.scope, "name"]]],
          ],
        ]
      );
    });
  });
});

function assertParse(parseResult, expected) {
  if (expected === null) {
    assert.isNull(parseResult);
  } else {
    assert(parseResult);
    assert.deepEqual(parseResult, {
      value: expected,
      rest: [],
    });
  }
}
