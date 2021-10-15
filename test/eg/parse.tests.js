import * as ops from "../../src/eg/ops.js";
import {
  args,
  assignment,
  backtickQuoteString,
  contextReference,
  expression,
  functionCall,
  getCall,
  group,
  indirectCall,
  key,
  list,
  literal,
  optionalWhitespace,
  protocolIndirectCall,
  singleQuoteString,
  slashCall,
  slashPath,
  spaceUrl,
  variableName,
  variableReference,
} from "../../src/eg/parse.js";
import assert from "../assert.js";

describe("parse", () => {
  it("args", () => {
    assert.deepEqual(args("a, b, c"), {
      value: [
        [ops.get, "a"],
        [ops.get, "b"],
        [ops.get, "c"],
      ],
      rest: "",
    });
    assert.deepEqual(args("(a, b, c)"), {
      value: [
        [ops.get, "a"],
        [ops.get, "b"],
        [ops.get, "c"],
      ],
      rest: "",
    });
    assert.deepEqual(args("()")?.value, []);
    assert.deepEqual(args(""), null);
  });

  it("assignment", () => {
    assert.deepEqual(assignment("foo = fn 'bar'")?.value, [
      "=",
      "foo",
      [[ops.get, "fn"], "bar"],
    ]);
    assert.deepEqual(assignment("data = obj.json")?.value, [
      "=",
      "data",
      [ops.get, "obj.json"],
    ]);
  });

  it("assignment with ƒ on right-hand side", () => {
    assert.deepEqual(assignment("foo = ƒ.json")?.value, [
      "=",
      "foo",
      [ops.get, "foo = ƒ.json"],
    ]);
    assert.deepEqual(assignment("foo = ƒ().js")?.value, [
      "=",
      "foo",
      [[ops.get, "foo = ƒ()"]],
    ]);
    assert.deepEqual(assignment("foo = ƒ('bar').js")?.value, [
      "=",
      "foo",
      [[ops.get, "foo = ƒ('bar')"], "bar"],
    ]);
  });

  it("assignment to splat on left with ƒ on right", () => {
    assert.deepEqual(assignment("...graph = ƒ().js")?.value, [
      "=",
      "...graph",
      [[ops.get, "...graph = ƒ()"]],
    ]);
  });

  it("assignment with variable pattern", () => {
    assert.deepEqual(assignment("{name}.html = foo($name.json)")?.value, [
      "=",
      [ops.variable, "name", ".html"],
      [
        [ops.get, "foo"],
        [ops.get, [ops.variable, "name", ".json"]],
      ],
    ]);
  });

  it("backtickQuoteString", () => {
    assert.deepEqual(backtickQuoteString("`Hello, world.`")?.value, [
      ops.quote,
      "Hello, world.",
    ]);
  });

  it("backtickQuotedString with variable pattern", () => {
    assert.deepEqual(backtickQuoteString("`$x.json`")?.value, [
      ops.quote,
      [ops.variable, "x", ".json"],
    ]);
    assert.deepEqual(backtickQuoteString("`foo $x.json bar`")?.value, [
      ops.quote,
      "foo ",
      [ops.variable, "x", ".json"],
      " bar",
    ]);
  });

  it("contextReference", () => {
    assert.deepEqual(contextReference("$context")?.value, [ops.context]);
  });

  it("expression", () => {
    assert.deepEqual(expression("obj.json")?.value, [ops.get, "obj.json"]);
    assert.deepEqual(expression("(fn a, b, c)")?.value, [
      [ops.get, "fn"],
      [ops.get, "a"],
      [ops.get, "b"],
      [ops.get, "c"],
    ]);
    assert.deepEqual(expression("foo.bar( 'hello' , 'world' )")?.value, [
      [ops.get, "foo.bar"],
      "hello",
      "world",
    ]);
    assert.deepEqual(expression("(fn)('a')")?.value, [[ops.get, "fn"], "a"]);
    assert.equal(expression("(foo"), null);
  });

  it("functionCall", () => {
    assert.deepEqual(functionCall("fn('a', 'b')")?.value, [
      [ops.get, "fn"],
      "a",
      "b",
    ]);
    assert.deepEqual(functionCall("fn 'a', 'b'")?.value, [
      [ops.get, "fn"],
      "a",
      "b",
    ]);
    assert.deepEqual(functionCall("fn a, b")?.value, [
      [ops.get, "fn"],
      [ops.get, "a"],
      [ops.get, "b"],
    ]);
    assert.deepEqual(functionCall("fn a(b), c")?.value, [
      [ops.get, "fn"],
      [
        [ops.get, "a"],
        [ops.get, "b"],
      ],
      [ops.get, "c"],
    ]);
  });

  it("functionCall with path syntax", () => {
    assert.deepEqual(slashCall("fn/a/b/c")?.value, [
      [ops.get, "fn"],
      "a",
      "b",
      "c",
    ]);
    assert.deepEqual(slashCall("about:blank")?.value, [
      [ops.get, "about"],
      "blank",
    ]);
    assert.deepEqual(slashCall("https://example.com/foo/bar.json")?.value, [
      [ops.get, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
  });

  it("functionCall with variable reference", () => {
    assert.deepEqual(functionCall("fn($name.json)")?.value, [
      [ops.get, "fn"],
      [ops.get, [ops.variable, "name", ".json"]],
    ]);
  });

  it("getCall", () => {
    assert.deepEqual(getCall("hello"), {
      value: [ops.get, "hello"],
      rest: "",
    });
    assert.deepEqual(getCall("$context"), {
      value: [ops.context],
      rest: "",
    });
  });

  it("group", () => {
    assert.deepEqual(group(" ( hello )")?.value, [ops.get, "hello"]);
    assert.deepEqual(group("(((nested)))")?.value, [ops.get, "nested"]);
    assert.equal(group("("), null);
  });

  it("indirectFunctionCall", () => {
    assert.deepEqual(indirectCall("(fn()) 'a'")?.value, [
      [[ops.get, "fn"]],
      "a",
    ]);
    assert.deepEqual(indirectCall("(fn()) (a, b)")?.value, [
      [[ops.get, "fn"]],
      [ops.get, "a"],
      [ops.get, "b"],
    ]);
    assert.deepEqual(indirectCall("(fn())"), null);
  });

  it("key", () => {
    assert.deepEqual(key("foo")?.value, "foo");
    assert.deepEqual(key("{name}.yaml")?.value, [
      ops.variable,
      "name",
      ".yaml",
    ]);
    assert.deepEqual(key("{x}.html = marked $x.md")?.value, [
      "=",
      [ops.variable, "x", ".html"],
      [
        [ops.get, "marked"],
        [ops.get, [ops.variable, "x", ".md"]],
      ],
    ]);
  });

  it("list", () => {
    assert.equal(list(""), null);
    assert.deepEqual(list(" a")?.value, [[ops.get, "a"]]);
    assert.deepEqual(list(" a , b,c, d , e")?.value, [
      [ops.get, "a"],
      [ops.get, "b"],
      [ops.get, "c"],
      [ops.get, "d"],
      [ops.get, "e"],
    ]);
    assert.deepEqual(list(`'foo', 'bar'`)?.value, ["foo", "bar"]);
    assert.deepEqual(list("a(b), c")?.value, [
      [
        [ops.get, "a"],
        [ops.get, "b"],
      ],
      [ops.get, "c"],
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

  it("protocolIndirectCall", () => {
    assert.deepEqual(protocolIndirectCall("fn:a/b")?.value, [
      [[ops.get, "fn"]],
      "a",
      "b",
    ]);
  });

  it("singleQuoteString", () => {
    assert.deepEqual(singleQuoteString(`'hello'`)?.value, "hello");
  });

  it("slashCall", () => {
    assert.deepEqual(slashCall("graph/")?.value, [[ops.get, "graph"]]);
    assert.deepEqual(slashCall("graph/foo/bar")?.value, [
      [ops.get, "graph"],
      "foo",
      "bar",
    ]);
    assert.deepEqual(slashCall("$context/file")?.value, [
      [ops.context],
      "file",
    ]);
  });

  it("slashPath", () => {
    assert.deepEqual(slashPath("foo/bar/baz")?.value, ["foo", "bar", "baz"]);
    assert.deepEqual(slashPath("foo/bar/baz/")?.value, [
      "foo",
      "bar",
      "baz",
      "",
    ]);
  });

  it("spaceUrl", () => {
    assert.deepEqual(spaceUrl("https example.com foo bar.json")?.value, [
      [ops.get, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assert.deepEqual(spaceUrl("http example.org $x data.json")?.value, [
      [ops.get, "http"],
      "example.org",
      [ops.variable, "x", null],
      "data.json",
    ]);
  });

  it("variableName", () => {
    assert.deepEqual(variableName("foo.bar"), {
      value: "foo",
      rest: ".bar",
    });
  });

  it("variableReference", () => {
    assert.deepEqual(variableReference("$name")?.value, [
      ops.variable,
      "name",
      null,
    ]);
    assert.deepEqual(variableReference("$name.json")?.value, [
      ops.variable,
      "name",
      ".json",
    ]);
  });

  it("whitespace", () => {
    assert.deepEqual(optionalWhitespace("   hello"), {
      value: null,
      rest: "hello",
    });
  });
});
