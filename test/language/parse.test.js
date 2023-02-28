import { tokenType } from "../../src/language/lex.js";
import * as ops from "../../src/language/ops.js";
import {
  args,
  array,
  assignment,
  expression,
  functionComposition,
  getReference,
  graph,
  graphDocument,
  group,
  lambda,
  list,
  number,
  object,
  objectProperty,
  objectPropertyOrShorthand,
  percentCall,
  percentPath,
  protocolCall,
  slashCall,
  slashPath,
  string,
  substitution,
  templateDocument,
  templateLiteral,
  urlProtocolCall,
} from "../../src/language/parse.js";
import assert from "../assert.js";

describe.only("parse", () => {
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

  it("assignment", () => {
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
    // assertParse(assignment("foo = fn 'bar'"), [
    //   ops.assign,
    //   "foo",
    //   [[ops.scope, "fn"], "bar"],
    // ]);
  });

  it("expression", () => {
    assertParse(
      expression([{ type: tokenType.REFERENCE, lexeme: "obj.json" }]),
      [ops.scope, "obj.json"]
    );
    // assertParse(expression("(fn a, b, c)"), [
    //   [ops.scope, "fn"],
    //   [ops.scope, "a"],
    //   [ops.scope, "b"],
    //   [ops.scope, "c"],
    // ]);
    // assertParse(expression("foo.bar( 'hello' , 'world' )"), [
    //   [ops.scope, "foo.bar"],
    //   "hello",
    //   "world",
    // ]);
    // assertParse(expression("(fn)('a')"), [[ops.scope, "fn"], "a"]);
    assertParse(expression([{ type: tokenType.NUMBER, lexeme: "1" }]), 1);
    // assert.equal(expression("(foo"), null);
    // assertParse(expression("{ a:1, b:2 }"), [ops.object, { a: 1, b: 2 }]);
    // assertParse(expression("serve { index.html: 'hello' }"), [
    //   [ops.scope, "serve"],
    //   [ops.object, { "index.html": "hello" }],
    // ]);
  });

  it.skip("expression with function with space-separated arguments, mixed argument types", () => {
    assertParse(expression(`copy app(formulas), files 'snapshot'`), [
      [ops.scope, "copy"],
      [
        [ops.scope, "app"],
        [ops.scope, "formulas"],
      ],
      [[ops.scope, "files"], "snapshot"],
    ]);
  });

  it.skip("functionComposition", () => {
    assertParse(functionComposition("fn()"), [[ops.scope, "fn"]]);
    assertParse(functionComposition("fn('arg')"), [[ops.scope, "fn"], "arg"]);
    assertParse(functionComposition("fn('a', 'b')"), [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assertParse(functionComposition("fn 'a', 'b'"), [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assertParse(functionComposition("fn a, b"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    // A call with implicit parentheses can't span newlines.
    assertParse(functionComposition("fn\na, b"), null);
    assertParse(functionComposition("fn(\n  a\n  b\n)"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse(functionComposition("fn a(b), c"), [
      [ops.scope, "fn"],
      [
        [ops.scope, "a"],
        [ops.scope, "b"],
      ],
      [ops.scope, "c"],
    ]);
    assertParse(functionComposition("fn1 fn2 'arg'"), [
      [ops.scope, "fn1"],
      [[ops.scope, "fn2"], "arg"],
    ]);
    assertParse(functionComposition("fn a, b, { c:1 }"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.object, { c: 1 }],
    ]);
  });

  it.skip("functionComposition indirect", () => {
    assertParse(functionComposition("(fn()) 'arg'"), [
      [[ops.scope, "fn"]],
      "arg",
    ]);
    assertParse(functionComposition("(fn()) (a, b)"), [
      [[ops.scope, "fn"]],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse(functionComposition("fn('a')('b')"), [
      [[ops.scope, "fn"], "a"],
      "b",
    ]);
    assert.equal(functionComposition("(fn())"), null);
  });

  it("getReference", () => {
    assertParse(
      getReference([{ type: tokenType.REFERENCE, lexeme: "hello" }]),
      [ops.scope, "hello"]
    );
  });

  it("graph", () => {
    assertParse(
      graph([{ type: tokenType.LEFT_BRACE }, { type: tokenType.RIGHT_BRACE }]),
      [ops.graph, {}]
    );
    // assertParse(graph("{ x = fn('a') }"), [
    //   ops.graph,
    //   {
    //     x: [[ops.scope, "fn"], "a"],
    //   },
    // ]);
  });

  it("graphDocument", () => {
    assertParse(graphDocument([]), [ops.graph, {}]);
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
    assertParse(
      group([
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.REFERENCE, lexeme: "hello" },
        { type: tokenType.RIGHT_PAREN },
      ]),
      [ops.scope, "hello"]
    );
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
    // assertParse(group("(fn())"), [[ops.scope, "fn"]]);
    // assert.equal(group("("), null);
  });

  it("lambda", () => {
    assertParse(
      lambda([
        { type: tokenType.EQUALS },
        { type: tokenType.REFERENCE, lexeme: "message" },
      ]),
      [ops.lambda, [ops.scope, "message"]]
    );
    // assertParse(lambda("=`Hello, {{name}}.`"), [
    //   ops.lambda,
    //   [ops.concat, "Hello, ", [ops.scope, "name"], "."],
    // ]);
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
    // "{ a: 1, b }"
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
    assertParse(
      objectProperty([
        { type: tokenType.REFERENCE, lexeme: "a" },
        { type: tokenType.COLON },
        { type: tokenType.NUMBER, lexeme: "1" },
      ]),
      { a: 1 }
    );
    assertParse(
      objectProperty([
        { type: tokenType.REFERENCE, lexeme: "name" },
        { type: tokenType.COLON },
        { type: tokenType.STRING, lexeme: "Alice" },
      ]),
      { name: "Alice" }
    );
    // assertParse(objectProperty("x : fn('a')"), { x: [[ops.scope, "fn"], "a"] });
  });

  it("objectPropertyOrShorthand", () => {
    assertParse(
      objectPropertyOrShorthand([{ type: tokenType.REFERENCE, lexeme: "foo" }]),
      {
        foo: [ops.inherited, "foo"],
      }
    );
  });

  it.skip("percentCall", () => {
    assertParse(percentCall("graph%"), [ops.scope, "graph", undefined]);
    assertParse(percentCall("graph%foo%bar"), [
      ops.scope,
      "graph",
      "foo",
      "bar",
    ]);
  });

  it.skip("percentPath", () => {
    assertParse(percentPath("foo%bar%baz"), ["foo", "bar", "baz"]);
    assertParse(percentPath("foo%bar%baz%"), ["foo", "bar", "baz", undefined]);
  });

  it.skip("protocolCall", () => {
    assertParse(protocolCall("foo://bar"), [[ops.scope, "foo"], "bar"]);
    assertParse(protocolCall("fn:/a/b"), [[ops.scope, "fn"], "a", "b"]);
  });

  it("slashCall", () => {
    assertParse(
      slashCall([
        { type: tokenType.REFERENCE, lexeme: "graph" },
        { type: tokenType.SLASH },
      ]),
      [ops.scope, "graph", undefined]
    );
    assertParse(
      slashCall([
        { type: tokenType.REFERENCE, lexeme: "graph" },
        { type: tokenType.SLASH },
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.SLASH },
        { type: tokenType.REFERENCE, lexeme: "bar" },
      ]),
      [ops.scope, "graph", "foo", "bar"]
    );
    assertParse(
      slashCall([
        { type: tokenType.SLASH },
        { type: tokenType.SLASH },
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.SLASH },
        { type: tokenType.REFERENCE, lexeme: "bar" },
      ]),
      [ops.scope, "foo", "bar"]
    );
  });

  it("slashPath", () => {
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
    assertParse(
      slashPath([
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.SLASH },
      ]),
      ["foo", undefined]
    );
  });

  it.skip("slashCalls with functions", () => {
    assertParse(expression("fn()/key"), [[[ops.scope, "fn"]], "key"]);
    assertParse(expression("(fn())/key"), [[[ops.scope, "fn"]], "key"]);
    assertParse(slashCall("fn('a', 'b')/c/d"), [
      [[ops.scope, "fn"], "a", "b"],
      "c",
      "d",
    ]);
    assertParse(expression("graph/key()"), [[ops.scope, "graph", "key"]]);
    assertParse(expression("fn1()/fn2()"), [[[[ops.scope, "fn1"]], "fn2"]]);
  });

  it("string", () => {
    assertParse(string([{ type: tokenType.STRING, lexeme: "Hello" }]), "Hello");
  });

  it("substitution", () => {
    assertParse(
      substitution([
        { type: tokenType.DOUBLE_LEFT_BRACE },
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.DOUBLE_RIGHT_BRACE },
      ]),
      [ops.scope, "foo"]
    );
  });

  it("templateDocument", () => {
    assertParse(
      templateDocument([
        { type: tokenType.STRING, lexeme: "hello" },
        { type: tokenType.DOUBLE_LEFT_BRACE },
        { type: tokenType.REFERENCE, lexeme: "foo" },
        { type: tokenType.DOUBLE_RIGHT_BRACE },
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
    // assertParse(templateLiteral("`{{map(people, =`{{name}}`)}}`"), [
    //   ops.concat,
    //   [
    //     [ops.scope, "map"],
    //     [ops.scope, "people"],
    //     [ops.lambda, [ops.concat, [ops.scope, "name"]]],
    //   ],
    // ]);
  });

  it.skip("urlProtocolCall", () => {
    assertParse(urlProtocolCall("https://example.com/foo/"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      undefined,
    ]);
    assertParse(urlProtocolCall("https://example.com/foo/bar.json"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assertParse(urlProtocolCall("https:example.com"), [
      [ops.scope, "https"],
      "example.com",
    ]);
  });

  it.skip("urlProtocolCall with functionComposition", () => {
    assertParse(expression("https://example.com/graph.yaml 'key'"), [
      [[ops.scope, "https"], "example.com", "graph.yaml"],
      "key",
    ]);
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
