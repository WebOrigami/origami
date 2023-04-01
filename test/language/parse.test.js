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
import assert from "../assert.js";

describe("parse", () => {
  describe("absoluteFilePath", () => {
    it("/foo/bar", () => {
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
    it("[]", () => {
      assertParse(
        array([
          { type: tokenType.LEFT_BRACKET },
          { type: tokenType.RIGHT_BRACKET },
        ]),
        [ops.array]
      );
    });

    it("[1, 2, 3]", () => {
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
    it("[1", () => {
      assert.throws(() =>
        array([
          { type: tokenType.LEFT_BRACKET },
          { type: tokenType.NUMBER, lexeme: "1" },
        ])
      );
    });
  });

  describe("assignment", () => {
    it("data = obj.json", () => {
      assertParse(
        assignment([
          {
            type: tokenType.REFERENCE,
            lexeme: "data",
          },
          { type: tokenType.EQUALS },
          { type: tokenType.REFERENCE, lexeme: "obj.json" },
        ]),
        [ops.assign, "data", [ops.scope, "obj.json"]]
      );
    });

    it("foo = fn 'bar'", () => {
      assertParse(
        assignment([
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.EQUALS },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
          { type: tokenType.STRING, lexeme: "bar" },
        ]),
        [ops.assign, "foo", [[ops.scope, "fn"], "bar"]]
      );
    });
  });

  describe("expression", () => {
    it("obj.json", () => {
      assertParse(
        expression([{ type: tokenType.REFERENCE, lexeme: "obj.json" }]),
        [ops.scope, "obj.json"]
      );
    });

    it("(fn a, b, c)", () => {
      assertParse(
        expression([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
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

    it("foo.bar('hello', 'world')", () => {
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

    it("(fn)('a')", () => {
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

    it("1", () => {
      assertParse(expression([{ type: tokenType.NUMBER, lexeme: "1" }]), 1);
    });

    it("(foo", () => {
      assert.equal(
        expression([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "foo" },
        ]),
        null
      );
    });

    it("{ a: 1, b: 2 }", () => {
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

    it("serve { index.html: 'hello' }", () => {
      assertParse(
        expression([
          { type: tokenType.REFERENCE, lexeme: "serve" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
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

    it("fn =`x`", () => {
      assertParse(
        expression([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
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

    it("copy app(formulas), files 'snapshot'", () => {
      assertParse(
        expression([
          { type: tokenType.REFERENCE, lexeme: "copy" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
          { type: tokenType.REFERENCE, lexeme: "app" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "formulas" },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.SEPARATOR },
          { type: tokenType.REFERENCE, lexeme: "files" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
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

    it("@map/values @input, =`<li>{{@value}}</li>`", () => {
      assertParse(
        expression([
          { type: tokenType.REFERENCE, lexeme: "@map" },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "values" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
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
    it("fn()", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [[ops.scope, "fn"]]
      );
    });

    it("fn(arg)", () => {
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

    it("fn(a, b)", () => {
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

    it("fn()(arg)", () => {
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

    it("fn()/key", () => {
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

    it("graph/", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "graph" },
          { type: tokenType.SLASH, lexeme: "/" },
        ]),
        [[ops.scope, "graph"], undefined]
      );
    });

    it("graph/key", () => {
      assertParse(
        functionComposition([
          { type: tokenType.REFERENCE, lexeme: "graph" },
          { type: tokenType.SLASH, lexeme: "/" },
          { type: tokenType.REFERENCE, lexeme: "key" },
        ]),
        [[ops.scope, "graph"], "key"]
      );
    });

    it("graph/foo/bar", () => {
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

    it("graph/key()", () => {
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

    it("fn()/key()", () => {
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

    it("(fn())('arg')", () => {
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

    it("fn('a')('b')", () => {
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

    it("(fn())(a, b)", () => {
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
  });

  describe("graph", () => {
    it("{}", () => {
      assertParse(
        graph([
          { type: tokenType.LEFT_BRACE },
          { type: tokenType.RIGHT_BRACE },
        ]),
        [ops.graph, {}]
      );
    });

    it("{ x = fn('a') }", () => {
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
    it("{}", () => {
      assertParse(graphDocument([]), [ops.graph, {}]);
    });

    it("{ a = 1, b }", () => {
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
    it("(hello)", () => {
      assertParse(
        group([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "hello" },
          { type: tokenType.RIGHT_PAREN },
        ]),
        [ops.scope, "hello"]
      );
    });

    it("(((nested)))", () => {
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

    it("(fn())", () => {
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
    it("(", () => {
      assert.equal(group([{ type: tokenType.LEFT_PAREN }]), null);
    });
  });

  describe("implicitParensCall", () => {
    it("fn arg", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
          { type: tokenType.REFERENCE, lexeme: "arg" },
        ]),
        [
          [ops.scope, "fn"],
          [ops.scope, "arg"],
        ]
      );
    });

    it("fn 'a', 'b'", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
          { type: tokenType.STRING, lexeme: "a" },
          { type: tokenType.SEPARATOR },
          { type: tokenType.STRING, lexeme: "b" },
        ]),
        [[ops.scope, "fn"], "a", "b"]
      );
    });

    it("fn a(b), c", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
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

    it("fn1 fn2 'arg'", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "fn1" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
          { type: tokenType.REFERENCE, lexeme: "fn2" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
          { type: tokenType.STRING, lexeme: "arg" },
        ]),
        [
          [ops.scope, "fn1"],
          [[ops.scope, "fn2"], "arg"],
        ]
      );
    });

    it("(fn()) 'arg'", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.REFERENCE, lexeme: "fn" },
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.RIGHT_PAREN },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
          { type: tokenType.STRING, lexeme: "arg" },
        ]),
        [[[ops.scope, "fn"]], "arg"]
      );
    });

    it("https://example.com/graph.yaml 'key'", () => {
      assertParse(
        implicitParensCall([
          { type: tokenType.REFERENCE, lexeme: "https" },
          { type: tokenType.COLON },
          { type: tokenType.SLASH },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "example.com" },
          { type: tokenType.SLASH },
          { type: tokenType.REFERENCE, lexeme: "graph.yaml" },
          { type: tokenType.IMPLICIT_PARENS, lexeme: " " },
          { type: tokenType.STRING, lexeme: "key" },
        ]),
        [[ops.https, "example.com", "graph.yaml"], "key"]
      );
    });
  });

  describe("lambda", () => {
    it("=message", () => {
      assertParse(
        lambda([
          { type: tokenType.EQUALS },
          { type: tokenType.REFERENCE, lexeme: "message" },
        ]),
        [ops.lambda, [ops.scope, "message"]]
      );
    });

    it("=`Hello, {{name}}.`", () => {
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
    it("", () => {
      assertParse(list([]), []);
    });

    it("a", () => {
      assertParse(list([{ type: tokenType.REFERENCE, lexeme: "a" }]), [
        [ops.scope, "a"],
      ]);
    });

    it("a, b, c", () => {
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
    it("1", () => {
      assertParse(number([{ type: tokenType.NUMBER, lexeme: "1" }]), 1);
    });
  });

  describe("object", () => {
    it("{}", () => {
      assertParse(
        object([
          { type: tokenType.LEFT_BRACE },
          { type: tokenType.RIGHT_BRACE },
        ]),
        [ops.object, {}]
      );
    });

    it("{ a: 1, b }", () => {
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
    it("{ a: 1 }", () => {
      assertParse(
        objectProperty([
          { type: tokenType.REFERENCE, lexeme: "a" },
          { type: tokenType.COLON },
          { type: tokenType.NUMBER, lexeme: "1" },
        ]),
        { a: 1 }
      );
    });

    it("{ name: 'Alice' }", () => {
      assertParse(
        objectProperty([
          { type: tokenType.REFERENCE, lexeme: "name" },
          { type: tokenType.COLON },
          { type: tokenType.STRING, lexeme: "Alice" },
        ]),
        { name: "Alice" }
      );
    });

    it("x: fn('a')", () => {
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
    it("foo", () => {
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
    it("()", () => {
      assertParse(
        parensArgs([
          { type: tokenType.LEFT_PAREN },
          { type: tokenType.RIGHT_PAREN },
        ]),
        []
      );
    });
    it("(a, b, c)", () => {
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
    it("01", () => {
      assertParse(pathKey([{ type: tokenType.NUMBER, lexeme: "01" }]), "01");
    });
  });

  describe("protocolCall", () => {
    it("foo://bar", () => {
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

    it("https://example.com/foo/", () => {
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

    it("http:example.com", () => {
      assertParse(
        protocolCall([
          { type: tokenType.REFERENCE, lexeme: "http" },
          { type: tokenType.COLON },
          { type: tokenType.REFERENCE, lexeme: "example.com" },
        ]),
        [ops.http, "example.com"]
      );
    });

    it("http://localhost:5000/foo", () => {
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
    it("hello", () => {
      assertParse(
        scopeReference([{ type: tokenType.REFERENCE, lexeme: "hello" }]),
        [ops.scope, "hello"]
      );
    });
  });

  describe("slashPath", () => {
    it("foo/bar/baz", () => {
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
    it("foo/", () => {
      assertParse(
        slashPath([
          { type: tokenType.REFERENCE, lexeme: "foo" },
          { type: tokenType.SLASH },
        ]),
        ["foo", undefined]
      );
    });
    it("month/12", () => {
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
    it("Hello", () => {
      assertParse(
        string([{ type: tokenType.STRING, lexeme: "Hello" }]),
        "Hello"
      );
    });
  });

  describe("substitution", () => {
    it("{{foo}}", () => {
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
    it("hello{{foo}}world", () => {
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
    it("`Hello, world.`", () => {
      assertParse(
        templateLiteral([
          { type: tokenType.BACKTICK },
          { type: tokenType.STRING, lexeme: "Hello, world." },
          { type: tokenType.BACKTICK },
        ]),
        "Hello, world."
      );
    });

    it("`foo {{x}} bar`", () => {
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

    it("`{{`nested`}}`", () => {
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

    it("`{{map(people, =`{{name}}`)}}`", () => {
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
