import { tokenType } from "../../src/language/lex.js";
import * as ops from "../../src/language/ops.js";
import {
  absoluteFilePath,
  args,
  array,
  assignment,
  expression,
  functionComposition,
  graph,
  graphDocument,
  group,
  lambda,
  list,
  number,
  object,
  objectProperty,
  objectPropertyOrShorthand,
  pathHead,
  pathKey,
  protocolCall,
  scopeReference,
  slashCall,
  slashPath,
  string,
  substitution,
  templateDocument,
  templateLiteral,
} from "../../src/language/parse.js";
import assert from "../assert.js";

describe("parse", () => {
  it("absoluteFilePath", () => {
    // /foo/bar -- a leading slash indicates absolute file path
    assertParse(
      absoluteFilePath([
        { type: tokenType.SLASH, lexeme: "/" },
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.SLASH, lexeme: "/" },
        { type: tokenType.REFERENCE, lexeme: "bar" },
      ]),
      [ops.files, "/foo/bar"]
    );
  });

  it("args", () => {
    assert.equal(args([]), null);
    assertParse(
      args([
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
    assertParse(
      args([{ type: tokenType.LEFT_PAREN }, { type: tokenType.RIGHT_PAREN }]),
      []
    );
    assertParse(
      args([
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

  it("array", () => {
    assertParse(
      array([
        { type: tokenType.LEFT_BRACKET },
        { type: tokenType.RIGHT_BRACKET },
      ]),
      [ops.array]
    );
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

  it("array with unmatched bracket", () => {
    // [1
    assert.throws(() =>
      array([
        { type: tokenType.LEFT_BRACKET },
        { type: tokenType.NUMBER, lexeme: "1" },
      ])
    );
  });

  it("assignment", () => {
    // data = obj.json
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
    // foo = fn 'bar'
    assertParse(
      assignment([
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.EQUALS },
        { type: tokenType.REFERENCE, lexeme: "fn" },
        { type: tokenType.STRING, lexeme: "bar" },
      ]),
      [ops.assign, "foo", [[ops.scope, "fn"], "bar"]]
    );
  });

  it("expression", () => {
    // obj.json
    assertParse(
      expression([{ type: tokenType.REFERENCE, lexeme: "obj.json" }]),
      [ops.scope, "obj.json"]
    );
    // (fn a, b, c)
    assertParse(
      expression([
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.REFERENCE, lexeme: "fn" },
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
    // foo.bar('hello', 'world')
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
    // (fn)('a')
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
    assertParse(expression([{ type: tokenType.NUMBER, lexeme: "1" }]), 1);
    // (foo
    assert.equal(
      expression([
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.REFERENCE, lexeme: "foo" },
      ]),
      null
    );
    // { a: 1, b: 2 }
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
    // serve { index.html: 'hello' }
    assertParse(
      expression([
        { type: tokenType.REFERENCE, lexeme: "serve" },
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

  it("expression with function with space-separated arguments, mixed argument types", () => {
    // copy app(formulas), files 'snapshot'
    assertParse(
      expression([
        { type: tokenType.REFERENCE, lexeme: "copy" },
        { type: tokenType.REFERENCE, lexeme: "app" },
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.REFERENCE, lexeme: "formulas" },
        { type: tokenType.RIGHT_PAREN },
        { type: tokenType.SEPARATOR },
        { type: tokenType.REFERENCE, lexeme: "files" },
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

  it("functionComposition", () => {
    // fn()
    assertParse(
      functionComposition([
        { type: tokenType.REFERENCE, lexeme: "fn" },
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.RIGHT_PAREN },
      ]),
      [[ops.scope, "fn"]]
    );
    // fn(a, b)
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
    // fn a, b
    assertParse(
      functionComposition([
        { type: tokenType.REFERENCE, lexeme: "fn" },
        { type: tokenType.STRING, lexeme: "a" },
        { type: tokenType.SEPARATOR },
        { type: tokenType.STRING, lexeme: "b" },
      ]),
      [[ops.scope, "fn"], "a", "b"]
    );
    // fn a(b), c
    assertParse(
      functionComposition([
        { type: tokenType.REFERENCE, lexeme: "fn" },
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
    // fn1 fn2 'arg'
    assertParse(
      functionComposition([
        { type: tokenType.REFERENCE, lexeme: "fn1" },
        { type: tokenType.REFERENCE, lexeme: "fn2" },
        { type: tokenType.STRING, lexeme: "arg" },
      ]),
      [
        [ops.scope, "fn1"],
        [[ops.scope, "fn2"], "arg"],
      ]
    );
  });

  it("functionComposition indirect", () => {
    // (fn()) 'arg'
    assertParse(
      functionComposition([
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.REFERENCE, lexeme: "fn" },
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.RIGHT_PAREN },
        { type: tokenType.RIGHT_PAREN },
        { type: tokenType.STRING, lexeme: "arg" },
      ]),
      [[[ops.scope, "fn"]], "arg"]
    );
    // (fn()) (a, b)
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
    // fn('a')('b')
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

  it("graph", () => {
    // {}
    assertParse(
      graph([{ type: tokenType.LEFT_BRACE }, { type: tokenType.RIGHT_BRACE }]),
      [ops.graph, {}]
    );
    // { x = fn('a') }
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

  it("graphDocument", () => {
    // {}
    assertParse(graphDocument([]), [ops.graph, {}]);
    // { a = 1, b }
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

  it("group", () => {
    // (hello)
    assertParse(
      group([
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.REFERENCE, lexeme: "hello" },
        { type: tokenType.RIGHT_PAREN },
      ]),
      [ops.scope, "hello"]
    );
    // (((nested)))
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
    // (fn())
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
    // (
    assert.equal(group([{ type: tokenType.LEFT_PAREN }]), null);
  });

  it("lambda", () => {
    // =message
    assertParse(
      lambda([
        { type: tokenType.EQUALS },
        { type: tokenType.REFERENCE, lexeme: "message" },
      ]),
      [ops.lambda, [ops.scope, "message"]]
    );
    // =`Hello, {{name}}.`
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

  it("list", () => {
    assertParse(list([]), []);
    assertParse(list([{ type: tokenType.REFERENCE, lexeme: "a" }]), [
      [ops.scope, "a"],
    ]);
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

  it("number", () => {
    assertParse(number([{ type: tokenType.NUMBER, lexeme: "1" }]), 1);
  });

  it("object", () => {
    // {}
    assertParse(
      object([{ type: tokenType.LEFT_BRACE }, { type: tokenType.RIGHT_BRACE }]),
      [ops.object, {}]
    );
    // { a: 1, b }
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

  it("objectProperty", () => {
    // { a: 1 }
    assertParse(
      objectProperty([
        { type: tokenType.REFERENCE, lexeme: "a" },
        { type: tokenType.COLON },
        { type: tokenType.NUMBER, lexeme: "1" },
      ]),
      { a: 1 }
    );
    // { name: 'Alice' }
    assertParse(
      objectProperty([
        { type: tokenType.REFERENCE, lexeme: "name" },
        { type: tokenType.COLON },
        { type: tokenType.STRING, lexeme: "Alice" },
      ]),
      { name: "Alice" }
    );
    // x: fn('a')
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

  it("objectPropertyOrShorthand", () => {
    assertParse(
      objectPropertyOrShorthand([{ type: tokenType.REFERENCE, lexeme: "foo" }]),
      {
        foo: [ops.inherited, "foo"],
      }
    );
  });

  it("pathHead", () => {
    // example.com
    assertParse(
      pathHead([{ type: tokenType.REFERENCE, lexeme: "example.com" }]),
      [ops.scope, "example.com"]
    );
  });

  it("pathKey", () => {
    // 01 [a path key that's a valid number but should be treated as a string]
    assertParse(pathKey([{ type: tokenType.NUMBER, lexeme: "01" }]), "01");
  });

  it("protocolCall", () => {
    // foo://bar
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
    // https://example.com/foo/
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
    // http:example.com
    assertParse(
      protocolCall([
        { type: tokenType.REFERENCE, lexeme: "http" },
        { type: tokenType.COLON },
        { type: tokenType.REFERENCE, lexeme: "example.com" },
      ]),
      [ops.http, "example.com"]
    );
    // http://localhost:5000/foo
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

  it("protocolCall with functionComposition", () => {
    // https://example.com/graph.yaml 'key'
    assertParse(
      expression([
        { type: tokenType.REFERENCE, lexeme: "https" },
        { type: tokenType.COLON },
        { type: tokenType.SLASH },
        { type: tokenType.SLASH },
        { type: tokenType.REFERENCE, lexeme: "example.com" },
        { type: tokenType.SLASH },
        { type: tokenType.REFERENCE, lexeme: "graph.yaml" },
        { type: tokenType.STRING, lexeme: "key" },
      ]),
      [[ops.https, "example.com", "graph.yaml"], "key"]
    );
  });

  it("scopeReference", () => {
    assertParse(
      scopeReference([{ type: tokenType.REFERENCE, lexeme: "hello" }]),
      [ops.scope, "hello"]
    );
  });

  it("slashCall", () => {
    // graph/
    assertParse(
      slashCall([
        { type: tokenType.REFERENCE, lexeme: "graph" },
        { type: tokenType.SLASH, lexeme: "/" },
      ]),
      [ops.scope, "graph", undefined]
    );
    // graph/foo/bar
    assertParse(
      slashCall([
        { type: tokenType.REFERENCE, lexeme: "graph" },
        { type: tokenType.SLASH, lexeme: "/" },
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.SLASH, lexeme: "/" },
        { type: tokenType.REFERENCE, lexeme: "bar" },
      ]),
      [ops.scope, "graph", "foo", "bar"]
    );
  });

  it("slashPath", () => {
    // foo/bar/baz
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
    // foo/
    assertParse(
      slashPath([
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.SLASH },
      ]),
      ["foo", undefined]
    );
    // month/12
    assertParse(
      slashPath([
        { type: tokenType.REFERENCE, lexeme: "month" },
        { type: tokenType.SLASH },
        { type: tokenType.NUMBER, lexeme: "12" },
      ]),
      ["month", "12"]
    );
  });

  it.only("functionComposition: fn(arg)", () => {
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

  it.only("functionComposition: fn arg", () => {
    assertParse(
      functionComposition([
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

  it.only("functionComposition: fn()(arg)", () => {
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

  it.only("functionComposition: fn()/key", () => {
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

  it.only("functionComposition: graph/key", () => {
    assertParse(
      functionComposition([
        { type: tokenType.REFERENCE, lexeme: "graph" },
        { type: tokenType.SLASH, lexeme: "/" },
        { type: tokenType.REFERENCE, lexeme: "key" },
      ]),
      [[ops.scope, "graph"], "key"]
    );
  });

  it.only("functionComposition: graph/key()", () => {
    assertParse(
      functionComposition([
        { type: tokenType.REFERENCE, lexeme: "graph" },
        { type: tokenType.SLASH, lexeme: "/" },
        { type: tokenType.REFERENCE, lexeme: "key" },
        { type: tokenType.LEFT_PAREN, lexeme: "(" },
        { type: tokenType.RIGHT_PAREN, lexeme: ")" },
      ]),
      [[ops.scope, "graph", "key"]]
    );
  });

  it("slashCalls with functions", () => {
    // // fn1()/fn2()
    // assertParse(
    //   expression([
    //     { type: tokenType.REFERENCE, lexeme: "fn1" },
    //     { type: tokenType.LEFT_PAREN, lexeme: "(" },
    //     { type: tokenType.RIGHT_PAREN, lexeme: ")" },
    //     { type: tokenType.SLASH, lexeme: "/" },
    //     { type: tokenType.REFERENCE, lexeme: "fn2" },
    //     { type: tokenType.LEFT_PAREN, lexeme: "(" },
    //     { type: tokenType.RIGHT_PAREN, lexeme: ")" },
    //   ]),
    //   [[[[ops.scope, "fn1"]], "fn2"]]
    // );
  });

  it("string", () => {
    assertParse(string([{ type: tokenType.STRING, lexeme: "Hello" }]), "Hello");
  });

  it("substitution", () => {
    assertParse(
      substitution([
        { type: tokenType.DOUBLE_LEFT_BRACE, lexeme: "{{" },
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.DOUBLE_RIGHT_BRACE, lexeme: "}}" },
      ]),
      [ops.scope, "foo"]
    );
  });

  it("templateDocument", () => {
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

  it("templateLiteral", () => {
    assertParse(
      templateLiteral([
        { type: tokenType.BACKTICK },
        { type: tokenType.STRING, lexeme: "Hello, world." },
        { type: tokenType.BACKTICK },
      ]),
      "Hello, world."
    );
  });

  it("templateLiteral with substitution", () => {
    // `foo {{x}} bar`
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
    // `{{`nested`}}`
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
    // `{{map(people, =`{{name}}`)}}`
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
