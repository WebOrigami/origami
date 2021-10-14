import * as ops from "../../src/eg/ops.js";
import {
  args,
  assignment,
  backtickQuoteString,
  expression,
  functionCall,
  group,
  indirectCall,
  key,
  list,
  literal,
  optionalWhitespace,
  singleQuoteString,
  slashCall,
  slashPath,
  spaceUrl,
  variableName,
  variableReference,
} from "../../src/eg/parse.js";
import assert from "../assert.js";

describe("parse", () => {
  it("whitespace", () => {
    assert.deepEqual(optionalWhitespace("   hello"), {
      value: null,
      rest: "hello",
    });
  });

  it("literal", () => {
    assert.deepEqual(literal("hello"), {
      value: [ops.get, "hello"],
      rest: "",
    });
    assert.equal(literal(""), null);
    assert.equal(literal("()"), null);
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

  it("single-quote string", () => {
    assert.deepEqual(singleQuoteString(`'hello'`)?.value, "hello");
  });

  it("function call", () => {
    assert.equal(functionCall("fn"), null); // didn't have parentheses
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

  it("group", () => {
    assert.deepEqual(group(" ( hello )")?.value, [ops.get, "hello"]);
    assert.deepEqual(group("(((nested)))")?.value, [ops.get, "nested"]);
    assert.equal(group("("), null);
  });

  it("indirect function call", () => {
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

  it("variable name", () => {
    assert.deepEqual(variableName("foo.bar"), {
      value: "foo",
      rest: ".bar",
    });
  });

  it("variable reference", () => {
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

  it("backtick quoted string", () => {
    assert.deepEqual(backtickQuoteString("`Hello, world.`")?.value, [
      ops.quote,
      "Hello, world.",
    ]);
  });

  it("backtick quoted string with variable pattern", () => {
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

  it("function call with variable reference", () => {
    assert.deepEqual(functionCall("fn($name.json)")?.value, [
      [ops.get, "fn"],
      [ops.get, [ops.variable, "name", ".json"]],
    ]);
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

  it("slash-delimited path", () => {
    assert.deepEqual(slashPath("foo/bar/baz")?.value, [
      [ops.quote, "foo"],
      [ops.quote, "bar"],
      [ops.quote, "baz"],
    ]);
  });

  it("function call with path syntax", () => {
    assert.deepEqual(slashCall("fn/a/b/c")?.value, [
      [ops.get, "fn"],
      [ops.quote, "a"],
      [ops.quote, "b"],
      [ops.quote, "c"],
    ]);
    assert.deepEqual(slashCall("about:blank")?.value, [
      [ops.get, "about"],
      [ops.quote, "blank"],
    ]);
    assert.deepEqual(slashCall("https://example.com/foo/bar.json")?.value, [
      [ops.get, "https"],
      [ops.quote, "example.com"],
      [ops.quote, "foo"],
      [ops.quote, "bar.json"],
    ]);
  });

  it("space-delimited url", () => {
    assert.deepEqual(spaceUrl("https example.com foo bar.json")?.value, [
      [ops.get, "https"],
      [ops.quote, "example.com"],
      [ops.quote, "foo"],
      [ops.quote, "bar.json"],
    ]);
    assert.deepEqual(spaceUrl("http example.org $x data.json")?.value, [
      [ops.get, "http"],
      [ops.quote, "example.org"],
      [ops.variable, "x", null],
      [ops.quote, "data.json"],
    ]);
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
      [[ops.get, "foo = ƒ().js"]],
    ]);
    assert.deepEqual(assignment("foo = ƒ('bar').js")?.value, [
      "=",
      "foo",
      [[ops.get, "foo = ƒ('bar').js"], "bar"],
    ]);
  });

  it("assignment to splat on left with ƒ on right", () => {
    assert.deepEqual(assignment("...graph = ƒ().js")?.value, [
      "=",
      "...graph",
      [[ops.get, "...graph = ƒ().js"]],
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

  it("key", () => {
    assert.deepEqual(key("foo")?.value, [ops.get, "foo"]);
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
});
