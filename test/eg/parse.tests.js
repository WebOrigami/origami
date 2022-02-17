import * as ops from "../../src/eg/ops.js";
import {
  args,
  assignment,
  expression,
  functionComposition,
  getReference,
  group,
  key,
  list,
  literal,
  number,
  optionalWhitespace,
  percentCall,
  percentPath,
  protocolCall,
  singleQuoteString,
  slashCall,
  slashPath,
  spacePathCall,
  spaceUrl,
  templateLiteral,
  thisReference,
  variableName,
  variableReference,
} from "../../src/eg/parse.js";
import assert from "../assert.js";

describe("parse", () => {
  it("args", () => {
    assertParse(args(" a, b, c"), [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse(args("(a, b, c)"), [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse(args("()"), []);
    assert.equal(args(""), null);
  });

  it("assignment", () => {
    assertParse(assignment("foo = fn 'bar'"), [
      "=",
      "foo",
      [[ops.scope, "fn"], "bar"],
    ]);
    assertParse(assignment("data = obj.json"), [
      "=",
      "data",
      [ops.scope, "obj.json"],
    ]);
    assertParse(assignment("match = .. .. .. foo bar"), [
      "=",
      "match",
      [ops.scope, "..", "..", "..", "foo", "bar"],
    ]);
  });

  it("assignment with `this` on right-hand side", () => {
    assertParse(assignment("foo = this.json"), [
      "=",
      "foo",
      [ops.scope, [ops.thisKey]],
    ]);
    assertParse(assignment("foo = this().js"), [
      "=",
      "foo",
      [[ops.scope, [ops.thisKey]]],
    ]);
    assertParse(assignment("foo = this('bar').js"), [
      "=",
      "foo",
      [[ops.scope, [ops.thisKey]], "bar"],
    ]);
  });

  it("assignment with variable pattern", () => {
    assertParse(assignment("{name}.html = foo(${name}.json)"), [
      "=",
      [ops.variable, "name", ".html"],
      [
        [ops.scope, "foo"],
        [ops.scope, [ops.variable, "name", ".json"]],
      ],
    ]);
  });

  it("expression", () => {
    assertParse(expression("obj.json"), [ops.scope, "obj.json"]);
    assertParse(expression("(fn a, b, c)"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse(expression("foo.bar( 'hello' , 'world' )"), [
      [ops.scope, "foo.bar"],
      "hello",
      "world",
    ]);
    assertParse(expression("(fn)('a')"), [[ops.scope, "fn"], "a"]);
    assertParse(expression("1"), 1);
    assert.equal(expression("(foo"), null);
  });

  it("expression with function with space-separated arguments, mixed argument types", () => {
    assertParse(expression(`copy app:formulas, files 'snapshot'`), [
      [ops.scope, "copy"],
      [[ops.scope, "app"], "formulas"],
      [[ops.scope, "files"], "snapshot"],
    ]);
  });

  it("functionComposition", () => {
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
  });

  it("functionComposition with variable reference", () => {
    assertParse(functionComposition("fn(${name}.json)"), [
      [ops.scope, "fn"],
      [ops.scope, [ops.variable, "name", ".json"]],
    ]);
  });

  it("functionComposition indirect", () => {
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
    assertParse(getReference("hello"), [ops.scope, "hello"]);
  });

  it("group", () => {
    assertParse(group(" ( hello )"), [ops.scope, "hello"]);
    assertParse(group("(((nested)))"), [ops.scope, "nested"]);
    assertParse(group("(fn())"), [[ops.scope, "fn"]]);
    assert.equal(group("("), null);
  });

  it("key", () => {
    assertParse(key("foo"), "foo");
    assertParse(key("{name}.yaml"), [ops.variable, "name", ".yaml"]);
    assertParse(key("{x}.html = marked ${x}.md"), [
      "=",
      [ops.variable, "x", ".html"],
      [
        [ops.scope, "marked"],
        [ops.scope, [ops.variable, "x", ".md"]],
      ],
    ]);
  });

  it("key marked as inheritable", () => {
    assertParse(key("…index.html = foo()"), [
      "=",
      "index.html",
      [[ops.scope, "foo"]],
    ]);
    assertParse(key("…a"), ["=", "a", [ops.scope, [ops.thisKey]]]);
  });

  it("list", () => {
    assert.equal(list(""), null);
    assertParse(list(" a"), [[ops.scope, "a"]]);
    assertParse(list(" a , b,c, d , e"), [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
      [ops.scope, "d"],
      [ops.scope, "e"],
    ]);
    assertParse(list(`'foo', 'bar'`), ["foo", "bar"]);
    assertParse(list("a(b), c"), [
      [
        [ops.scope, "a"],
        [ops.scope, "b"],
      ],
      [ops.scope, "c"],
    ]);
  });

  it("literalReference", () => {
    assert.deepEqual(literal("hello"), {
      value: "hello",
      rest: "",
    });
    assert.equal(literal(""), null);
    assert.equal(literal("()"), null);
  });

  it("number", () => {
    assertParse(number("1"), 1);
    assertParse(number("3.14159"), 3.14159);
    assertParse(number("-1"), -1);
  });

  it("percentCall", () => {
    assertParse(percentCall("graph%"), [ops.scope, "graph", undefined]);
    assertParse(percentCall("graph%foo%bar"), [
      ops.scope,
      "graph",
      "foo",
      "bar",
    ]);
  });

  it("percentPath", () => {
    assertParse(percentPath("foo%bar%baz"), ["foo", "bar", "baz"]);
    assertParse(percentPath("foo%bar%baz%"), ["foo", "bar", "baz", undefined]);
  });

  it("protocolCall", () => {
    assertParse(protocolCall("fn:a/b"), [[ops.scope, "fn"], "a", "b"]);
    assertParse(protocolCall("about:blank"), [[ops.scope, "about"], "blank"]);
    assertParse(protocolCall("https://example.com/foo/"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      undefined,
    ]);
    assertParse(protocolCall("https://example.com/foo/bar.json"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assertParse(protocolCall("foo:bar:baz"), [
      [ops.scope, "foo"],
      [[ops.scope, "bar"], "baz"],
    ]);
  });

  it("protocolCall with functionComposition", () => {
    assertParse(expression("https://example.com/graph.yaml 'key'"), [
      [[ops.scope, "https"], "example.com", "graph.yaml"],
      "key",
    ]);
  });

  it("singleQuoteString", () => {
    assertParse(singleQuoteString(`'hello'`), "hello");
  });

  it("slashCall", () => {
    assertParse(slashCall("graph/"), [ops.scope, "graph", undefined]);
    assertParse(slashCall("graph/foo/bar"), [ops.scope, "graph", "foo", "bar"]);
    assertParse(slashCall("//foo/bar"), [ops.scope, "foo", "bar"]);
    assertParse(slashCall("a/b/c.txt"), [ops.scope, "a", "b", "c.txt"]);
  });

  it("slashPath", () => {
    assertParse(slashPath("foo/bar/baz"), ["foo", "bar", "baz"]);
    assertParse(slashPath("foo/bar/baz/"), ["foo", "bar", "baz", undefined]);
  });

  it("slashCalls with functions", () => {
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

  it("spacePathCall", () => {
    assertParse(spacePathCall(".. .. .. foo bar"), [
      ops.scope,
      "..",
      "..",
      "..",
      "foo",
      "bar",
    ]);
  });

  it("spaceUrl", () => {
    assertParse(spaceUrl("https example.com foo bar.json"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assertParse(spaceUrl("http example.org ${x} data.json"), [
      [ops.scope, "http"],
      "example.org",
      [ops.scope, "x"],
      "data.json",
    ]);
  });

  it("templateLiteral", () => {
    assertParse(templateLiteral("`Hello, world.`"), "Hello, world.");
  });

  it("templateLiteral with substitution", () => {
    assertParse(templateLiteral("`${x}.json`"), [
      ops.concat,
      [ops.scope, "x"],
      ".json",
    ]);
    assertParse(templateLiteral("`foo ${x}.json bar`"), [
      ops.concat,
      "foo ",
      [ops.scope, "x"],
      ".json bar",
    ]);
    assertParse(templateLiteral("`foo ${ fn(a) } bar`"), [
      ops.concat,
      "foo ",
      [
        [ops.scope, "fn"],
        [ops.scope, "a"],
      ],
      " bar",
    ]);
  });

  it("thisReference", () => {
    assertParse(thisReference("this"), [ops.thisKey]);
    // If there's an extension after the 'this' keyword, it's a reference.
    // assert.equal(thisReference("this.foo"), null);
  });

  it("variableName", () => {
    assert.deepEqual(variableName("foo.bar"), {
      value: "foo",
      rest: ".bar",
    });
  });

  it("variableReference", () => {
    assertParse(variableReference("${name}"), [ops.variable, "name", null]);
    assertParse(variableReference("${name}.json"), [
      ops.variable,
      "name",
      ".json",
    ]);
  });

  it("whitespace", () => {
    assert.deepEqual(optionalWhitespace("   hello"), {
      value: true,
      rest: "hello",
    });
  });
});

function assertParse(parseResult, expected) {
  assert.equal(parseResult.rest, "");
  assert.deepEqual(parseResult.value, expected);
}
