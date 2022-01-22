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
  newCall,
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
  thisReference,
  variableName,
  variableReference,
} from "../../src/eg/parse.js";
import assert from "../assert.js";

describe("parse", () => {
  it("args", () => {
    assert.deepEqual(args(" a, b, c"), {
      value: [
        [ops.scope, "a"],
        [ops.scope, "b"],
        [ops.scope, "c"],
      ],
      rest: "",
    });
    assert.deepEqual(args("(a, b, c)"), {
      value: [
        [ops.scope, "a"],
        [ops.scope, "b"],
        [ops.scope, "c"],
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
      [[ops.scope, "fn"], "bar"],
    ]);
    assert.deepEqual(assignment("data = obj.json")?.value, [
      "=",
      "data",
      [ops.scope, "obj.json"],
    ]);
    assert.deepEqual(assignment("match = .. .. .. foo bar")?.value, [
      "=",
      "match",
      [ops.scope, "..", "..", "..", "foo", "bar"],
    ]);
  });

  it("assignment with `this` on right-hand side", () => {
    assert.deepEqual(assignment("foo = this.json")?.value, [
      "=",
      "foo",
      [ops.scope, [ops.thisKey]],
    ]);
    assert.deepEqual(assignment("foo = this().js")?.value, [
      "=",
      "foo",
      [[ops.scope, [ops.thisKey]]],
    ]);
    assert.deepEqual(assignment("foo = this('bar').js")?.value, [
      "=",
      "foo",
      [[ops.scope, [ops.thisKey]], "bar"],
    ]);
  });

  it("assignment with variable pattern", () => {
    assert.deepEqual(assignment("{name}.html = foo(${name}.json)")?.value, [
      "=",
      [ops.variable, "name", ".html"],
      [
        [ops.scope, "foo"],
        [ops.scope, [ops.variable, "name", ".json"]],
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
    assert.deepEqual(expression("obj.json")?.value, [ops.scope, "obj.json"]);
    assert.deepEqual(expression("(fn a, b, c)")?.value, [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assert.deepEqual(expression("foo.bar( 'hello' , 'world' )")?.value, [
      [ops.scope, "foo.bar"],
      "hello",
      "world",
    ]);
    assert.deepEqual(expression("(fn)('a')")?.value, [[ops.scope, "fn"], "a"]);
    assert.equal(expression("1")?.value, 1);
    assert.equal(expression("(foo"), null);
  });

  it("expression with function with space-separated arguments, mixed argument types", () => {
    assert.deepEqual(expression(`copy app:formulas, files 'snapshot'`)?.value, [
      [ops.scope, "copy"],
      [[ops.scope, "app"], "formulas"],
      [[ops.scope, "files"], "snapshot"],
    ]);
  });

  it("functionCall", () => {
    assert.deepEqual(functionCall("fn()")?.value, [[ops.scope, "fn"]]);
    assert.deepEqual(functionCall("fn('a', 'b')")?.value, [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assert.deepEqual(functionCall("fn 'a', 'b'")?.value, [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assert.deepEqual(functionCall("fn a, b")?.value, [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assert.deepEqual(functionCall("fn a(b), c")?.value, [
      [ops.scope, "fn"],
      [
        [ops.scope, "a"],
        [ops.scope, "b"],
      ],
      [ops.scope, "c"],
    ]);
  });

  it("functionCall with variable reference", () => {
    assert.deepEqual(functionCall("fn(${name}.json)")?.value, [
      [ops.scope, "fn"],
      [ops.scope, [ops.variable, "name", ".json"]],
    ]);
  });

  it("group", () => {
    assert.deepEqual(group(" ( hello )")?.value, [ops.scope, "hello"]);
    assert.deepEqual(group("(((nested)))")?.value, [ops.scope, "nested"]);
    assert.deepEqual(group("(fn())")?.value, [[ops.scope, "fn"]]);
    assert.equal(group("("), null);
  });

  it("indirectFunctionCall", () => {
    assert.deepEqual(indirectCall("(fn()) 'a'")?.value, [
      [[ops.scope, "fn"]],
      "a",
    ]);
    assert.deepEqual(indirectCall("(fn()) (a, b)")?.value, [
      [[ops.scope, "fn"]],
      [ops.scope, "a"],
      [ops.scope, "b"],
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
        [ops.scope, "marked"],
        [ops.scope, [ops.variable, "x", ".md"]],
      ],
    ]);
  });

  it("key marked as inheritable", () => {
    assert.deepEqual(key("…index.html = foo()")?.value, [
      "=",
      "index.html",
      [[ops.scope, "foo"]],
    ]);
    assert.deepEqual(key("…a")?.value, ["=", "a", [ops.scope, [ops.thisKey]]]);
  });

  it("list", () => {
    assert.equal(list(""), null);
    assert.deepEqual(list(" a")?.value, [[ops.scope, "a"]]);
    assert.deepEqual(list(" a , b,c, d , e")?.value, [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
      [ops.scope, "d"],
      [ops.scope, "e"],
    ]);
    assert.deepEqual(list(`'foo', 'bar'`)?.value, ["foo", "bar"]);
    assert.deepEqual(list("a(b), c")?.value, [
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
    assert.equal(number("1")?.value, 1);
    assert.equal(number("3.14159")?.value, 3.14159);
    assert.equal(number("-1")?.value, -1);
  });

  it("percentCall", () => {
    assert.deepEqual(percentCall("graph%")?.value, [
      ops.scope,
      "graph",
      undefined,
    ]);
    assert.deepEqual(percentCall("graph%foo%bar")?.value, [
      ops.scope,
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

  it("protocolCall", () => {
    assert.deepEqual(protocolCall("fn:a/b")?.value, [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assert.deepEqual(protocolCall("about:blank")?.value, [
      [ops.scope, "about"],
      "blank",
    ]);
    assert.deepEqual(protocolCall("https://example.com/foo/")?.value, [
      [ops.scope, "https"],
      "example.com",
      "foo",
      undefined,
    ]);
    assert.deepEqual(protocolCall("https://example.com/foo/bar.json")?.value, [
      [ops.scope, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assert.deepEqual(protocolCall("foo:bar:baz")?.value, [
      [ops.scope, "foo"],
      [[ops.scope, "bar"], "baz"],
    ]);
  });

  it("getReference", () => {
    assert.deepEqual(getReference("hello"), {
      value: [ops.scope, "hello"],
      rest: "",
    });
  });

  it("singleQuoteString", () => {
    assert.deepEqual(singleQuoteString(`'hello'`)?.value, "hello");
  });

  it("slashCall", () => {
    assert.deepEqual(slashCall("graph/")?.value, [
      ops.scope,
      "graph",
      undefined,
    ]);
    assert.deepEqual(slashCall("graph/foo/bar")?.value, [
      ops.scope,
      "graph",
      "foo",
      "bar",
    ]);
    assert.deepEqual(slashCall("fn('a', 'b')/c/d")?.value, [
      [[ops.scope, "fn"], "a", "b"],
      "c",
      "d",
    ]);
    assert.deepEqual(slashCall("//foo/bar")?.value, [ops.scope, "foo", "bar"]);
    assert.deepEqual(slashCall("a/b/c.txt")?.value, [
      ops.scope,
      "a",
      "b",
      "c.txt",
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
      [[ops.scope, "fn"]],
      "foo",
    ]);
  });

  it.only("newCall", () => {
    assert.deepEqual(newCall("functions/fn('arg')")?.value, [
      [ops.scope, "functions", "fn"],
      "arg",
    ]);
  });

  it("spacePathCall", () => {
    assert.deepEqual(spacePathCall(".. .. .. foo bar")?.value, [
      ops.scope,
      "..",
      "..",
      "..",
      "foo",
      "bar",
    ]);
  });

  it("spaceUrl", () => {
    assert.deepEqual(spaceUrl("https example.com foo bar.json")?.value, [
      [ops.scope, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assert.deepEqual(spaceUrl("http example.org ${x} data.json")?.value, [
      [ops.scope, "http"],
      "example.org",
      [ops.variable, "x", null],
      "data.json",
    ]);
  });

  it("thisReference", () => {
    assert.deepEqual(thisReference("this")?.value, [ops.thisKey]);
    // If there's an extension after the 'this' keyword, it's a reference.
    // assert.equal(thisReference("this.foo")?.value, null);
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
      value: true,
      rest: "hello",
    });
  });
});
