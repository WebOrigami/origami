import * as ops from "../../src/eg/ops.js";
import {
  args,
  assignment,
  backtickQuoteString,
  expression,
  functionCall,
  getReference,
  group,
  indirectCall,
  key,
  list,
  literal,
  optionalWhitespace,
  percentCall,
  percentPath,
  protocolIndirectCall,
  singleQuoteString,
  slashCall,
  slashPath,
  spacePathCall,
  spaceUrl,
  variableName,
  variableReference,
} from "../../src/eg/parse.js";
import assert from "../assert.js";

describe("parse", () => {
  it("args", () => {
    assert.deepEqual(args(" a, b, c"), {
      value: [
        [ops.graph, "a"],
        [ops.graph, "b"],
        [ops.graph, "c"],
      ],
      rest: "",
    });
    assert.deepEqual(args("(a, b, c)"), {
      value: [
        [ops.graph, "a"],
        [ops.graph, "b"],
        [ops.graph, "c"],
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
      [[ops.graph, "fn"], "bar"],
    ]);
    assert.deepEqual(assignment("data = obj.json")?.value, [
      "=",
      "data",
      [ops.graph, "obj.json"],
    ]);
    assert.deepEqual(assignment("match = .. .. .. foo bar")?.value, [
      "=",
      "match",
      [ops.graph, "..", "..", "..", "foo", "bar"],
    ]);
  });

  it("assignment with `this` on right-hand side", () => {
    assert.deepEqual(assignment("foo = this.json")?.value, [
      "=",
      "foo",
      [ops.graph, [ops.thisKey]],
    ]);
    assert.deepEqual(assignment("foo = this().js")?.value, [
      "=",
      "foo",
      [[ops.graph, [ops.thisKey]]],
    ]);
    assert.deepEqual(assignment("foo = this('bar').js")?.value, [
      "=",
      "foo",
      [[ops.graph, [ops.thisKey]], "bar"],
    ]);
  });

  it("assignment to splat on left with `this` on right", () => {
    assert.deepEqual(assignment("...graph = this().js")?.value, [
      "=",
      "...graph",
      [[ops.graph, [ops.thisKey]]],
    ]);
  });

  it("assignment with variable pattern", () => {
    assert.deepEqual(assignment("{name}.html = foo(${name}.json)")?.value, [
      "=",
      [ops.variable, "name", ".html"],
      [
        [ops.graph, "foo"],
        [ops.graph, [ops.variable, "name", ".json"]],
      ],
    ]);
  });

  it("backtickQuoteString", () => {
    assert.deepEqual(backtickQuoteString("`Hello, world.`")?.value, [
      ops.concat,
      "Hello, world.",
    ]);
  });

  it("backtickQuotedString with variable pattern", () => {
    assert.deepEqual(backtickQuoteString("`${x}.json`")?.value, [
      ops.concat,
      [ops.variable, "x", ".json"],
    ]);
    assert.deepEqual(backtickQuoteString("`foo ${x}.json bar`")?.value, [
      ops.concat,
      "foo ",
      [ops.variable, "x", ".json"],
      " bar",
    ]);
  });

  it("expression", () => {
    assert.deepEqual(expression("obj.json")?.value, [ops.graph, "obj.json"]);
    assert.deepEqual(expression("(fn a, b, c)")?.value, [
      [ops.graph, "fn"],
      [ops.graph, "a"],
      [ops.graph, "b"],
      [ops.graph, "c"],
    ]);
    assert.deepEqual(expression("foo.bar( 'hello' , 'world' )")?.value, [
      [ops.graph, "foo.bar"],
      "hello",
      "world",
    ]);
    assert.deepEqual(expression("(fn)('a')")?.value, [[ops.graph, "fn"], "a"]);
    assert.equal(expression("(foo"), null);
  });

  it("expression with function with space-separated arguments, mixed argument types", () => {
    assert.deepEqual(expression(`copy app:formulas, files 'snapshot'`)?.value, [
      [ops.graph, "copy"],
      [[ops.graph, "app"], "formulas"],
      [[ops.graph, "files"], "snapshot"],
    ]);
  });

  it("functionCall", () => {
    assert.deepEqual(functionCall("fn()")?.value, [[ops.graph, "fn"]]);
    assert.deepEqual(functionCall("fn('a', 'b')")?.value, [
      [ops.graph, "fn"],
      "a",
      "b",
    ]);
    assert.deepEqual(functionCall("fn 'a', 'b'")?.value, [
      [ops.graph, "fn"],
      "a",
      "b",
    ]);
    assert.deepEqual(functionCall("fn a, b")?.value, [
      [ops.graph, "fn"],
      [ops.graph, "a"],
      [ops.graph, "b"],
    ]);
    assert.deepEqual(functionCall("fn a(b), c")?.value, [
      [ops.graph, "fn"],
      [
        [ops.graph, "a"],
        [ops.graph, "b"],
      ],
      [ops.graph, "c"],
    ]);
  });

  it("functionCall with variable reference", () => {
    assert.deepEqual(functionCall("fn(${name}.json)")?.value, [
      [ops.graph, "fn"],
      [ops.graph, [ops.variable, "name", ".json"]],
    ]);
  });

  it("group", () => {
    assert.deepEqual(group(" ( hello )")?.value, [ops.graph, "hello"]);
    assert.deepEqual(group("(((nested)))")?.value, [ops.graph, "nested"]);
    assert.deepEqual(group("(fn())")?.value, [[ops.graph, "fn"]]);
    assert.equal(group("("), null);
  });

  it("indirectFunctionCall", () => {
    assert.deepEqual(indirectCall("(fn()) 'a'")?.value, [
      [[ops.graph, "fn"]],
      "a",
    ]);
    assert.deepEqual(indirectCall("(fn()) (a, b)")?.value, [
      [[ops.graph, "fn"]],
      [ops.graph, "a"],
      [ops.graph, "b"],
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
    assert.deepEqual(key("{x}.html = marked ${x}.md")?.value, [
      "=",
      [ops.variable, "x", ".html"],
      [
        [ops.graph, "marked"],
        [ops.graph, [ops.variable, "x", ".md"]],
      ],
    ]);
  });

  it("list", () => {
    assert.equal(list(""), null);
    assert.deepEqual(list(" a")?.value, [[ops.graph, "a"]]);
    assert.deepEqual(list(" a , b,c, d , e")?.value, [
      [ops.graph, "a"],
      [ops.graph, "b"],
      [ops.graph, "c"],
      [ops.graph, "d"],
      [ops.graph, "e"],
    ]);
    assert.deepEqual(list(`'foo', 'bar'`)?.value, ["foo", "bar"]);
    assert.deepEqual(list("a(b), c")?.value, [
      [
        [ops.graph, "a"],
        [ops.graph, "b"],
      ],
      [ops.graph, "c"],
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

  it("percentCall", () => {
    assert.deepEqual(percentCall("graph%")?.value, [
      ops.graph,
      "graph",
      undefined,
    ]);
    assert.deepEqual(percentCall("graph%foo%bar")?.value, [
      ops.graph,
      "graph",
      "foo",
      "bar",
    ]);
  });

  it("percentPath", () => {
    assert.deepEqual(percentPath("foo%bar%baz")?.value, ["foo", "bar", "baz"]);
    assert.deepEqual(percentPath("foo%bar%baz%")?.value, [
      "foo",
      "bar",
      "baz",
      undefined,
    ]);
  });

  it("protocolIndirectCall", () => {
    assert.deepEqual(protocolIndirectCall("fn:a/b")?.value, [
      [ops.graph, "fn"],
      "a",
      "b",
    ]);
    assert.deepEqual(protocolIndirectCall("about:blank")?.value, [
      [ops.graph, "about"],
      "blank",
    ]);
    assert.deepEqual(protocolIndirectCall("https://example.com/foo/")?.value, [
      [ops.graph, "https"],
      "example.com",
      "foo",
      undefined,
    ]);
    assert.deepEqual(
      protocolIndirectCall("https://example.com/foo/bar.json")?.value,
      [[ops.graph, "https"], "example.com", "foo", "bar.json"]
    );
    // assert.deepEqual(protocolIndirectCall("foo:bar:baz")?.value, [
    //   [ops.graph, "foo"],
    //   [[ops.graph, "bar"], "baz"],
    // ]);
  });

  it("getReference", () => {
    assert.deepEqual(getReference("hello"), {
      value: [ops.graph, "hello"],
      rest: "",
    });
  });

  it("singleQuoteString", () => {
    assert.deepEqual(singleQuoteString(`'hello'`)?.value, "hello");
  });

  it("slashCall", () => {
    assert.deepEqual(slashCall("graph/")?.value, [
      ops.graph,
      "graph",
      undefined,
    ]);
    assert.deepEqual(slashCall("graph/foo/bar")?.value, [
      ops.graph,
      "graph",
      "foo",
      "bar",
    ]);
    assert.deepEqual(slashCall("fn('a', 'b')/c/d")?.value, [
      [[ops.graph, "fn"], "a", "b"],
      "c",
      "d",
    ]);
  });

  it("slashPath", () => {
    assert.deepEqual(slashPath("foo/bar/baz")?.value, ["foo", "bar", "baz"]);
    assert.deepEqual(slashPath("foo/bar/baz/")?.value, [
      "foo",
      "bar",
      "baz",
      undefined,
    ]);
    assert.deepEqual(slashPath("(fn())/foo")?.value, [
      [[ops.graph, "fn"]],
      "foo",
    ]);
  });

  it("spacePathCall", () => {
    assert.deepEqual(spacePathCall(".. .. .. foo bar")?.value, [
      ops.graph,
      "..",
      "..",
      "..",
      "foo",
      "bar",
    ]);
  });

  it("spaceUrl", () => {
    assert.deepEqual(spaceUrl("https example.com foo bar.json")?.value, [
      [ops.graph, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assert.deepEqual(spaceUrl("http example.org ${x} data.json")?.value, [
      [ops.graph, "http"],
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
    assert.deepEqual(variableReference("${name}")?.value, [
      ops.variable,
      "name",
      null,
    ]);
    assert.deepEqual(variableReference("${name}.json")?.value, [
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
