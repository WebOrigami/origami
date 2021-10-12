import * as opcodes from "../../src/eg/opcodes.js";
import {
  args,
  assignment,
  backtickQuoteString,
  doubleQuoteString,
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
  it.skip("whitespace", () => {
    assert.deepEqual(optionalWhitespace("   hello"), {
      value: null,
      rest: "hello",
    });
  });

  it("literal", () => {
    assert.deepEqual(literal("hello"), {
      value: [opcodes.get, "hello"],
      rest: "",
    });
    assert.equal(literal("").value, undefined);
    assert.equal(literal("()").value, undefined);
  });

  it("list", () => {
    assert.equal(list("").value, undefined);
    assert.deepEqual(list(" a"), {
      value: [[[opcodes.get, "a"]]],
      rest: "",
    });
    assert.deepEqual(list(" a , b,c, d , e").value, [
      [[opcodes.get, "a"]],
      [[opcodes.get, "b"]],
      [[opcodes.get, "c"]],
      [[opcodes.get, "d"]],
      [[opcodes.get, "e"]],
    ]);
    assert.deepEqual(list(`"foo", "bar"`).value, [
      [opcodes.quote, "foo"],
      [opcodes.quote, "bar"],
    ]);
    assert.deepEqual(list("a(b), c").value, [
      [[opcodes.get, "a"], [[opcodes.get, "b"]]],
      [[opcodes.get, "c"]],
    ]);
  });

  it("args", () => {
    assert.deepEqual(args("a, b, c"), {
      value: [[[opcodes.get, "a"]], [[opcodes.get, "b"]], [[opcodes.get, "c"]]],
      rest: "",
    });
    assert.deepEqual(args("(a, b, c)"), {
      value: [[[opcodes.get, "a"]], [[opcodes.get, "b"]], [[opcodes.get, "c"]]],
      rest: "",
    });
    assert.deepEqual(args("()").value, []);
    assert.deepEqual(args("").value, undefined);
  });

  it("double-quote string", () => {
    assert.deepEqual(doubleQuoteString(`"hello"`).value, [
      opcodes.quote,
      "hello",
    ]);
  });

  it("single-quote string", () => {
    assert.deepEqual(singleQuoteString(`'hello'`).value, [
      opcodes.quote,
      "hello",
    ]);
  });

  it("function call", () => {
    assert.deepEqual(functionCall("fn"), {
      value: [[opcodes.get, "fn"]],
      rest: "",
    });
    assert.deepEqual(functionCall("fn('a', 'b')"), {
      value: [
        [opcodes.get, "fn"],
        [opcodes.quote, "a"],
        [opcodes.quote, "b"],
      ],
      rest: "",
    });
    assert.deepEqual(functionCall("fn 'a', 'b'"), {
      value: [
        [opcodes.get, "fn"],
        [opcodes.quote, "a"],
        [opcodes.quote, "b"],
      ],
      rest: "",
    });
    assert.deepEqual(functionCall("fn a, b"), {
      value: [[opcodes.get, "fn"], [[opcodes.get, "a"]], [[opcodes.get, "b"]]],
      rest: "",
    });
    assert.deepEqual(functionCall("fn a(b), c"), {
      value: [
        [opcodes.get, "fn"],
        [[opcodes.get, "a"], [[opcodes.get, "b"]]],
        [[opcodes.get, "c"]],
      ],
      rest: "",
    });
  });

  it("group", () => {
    assert.deepEqual(group(" ( hello )").value, [[opcodes.get, "hello"]]);
    assert.deepEqual(group("(((nested)))").value, [[opcodes.get, "nested"]]);
    assert.equal(group("(").value, undefined);
  });

  it("indirect function call", () => {
    assert.deepEqual(indirectCall("(fn) 'a'").value, [
      [[opcodes.get, "fn"]],
      [opcodes.quote, "a"],
    ]);
    assert.deepEqual(indirectCall("(fn) (a, b)").value, [
      [[opcodes.get, "fn"]],
      [[opcodes.get, "a"]],
      [[opcodes.get, "b"]],
    ]);
    assert.deepEqual(indirectCall("(fn)").value, undefined);
  });

  it("variable name", () => {
    assert.deepEqual(variableName("foo.bar"), {
      value: "foo",
      rest: ".bar",
    });
  });

  it("variable reference", () => {
    assert.deepEqual(variableReference("$name").value, [
      opcodes.variable,
      "name",
      null,
    ]);
    assert.deepEqual(variableReference("$name.json").value, [
      opcodes.variable,
      "name",
      ".json",
    ]);
  });

  it("backtick quoted string", () => {
    assert.deepEqual(backtickQuoteString("`Hello, world.`").value, [
      opcodes.quote,
      "Hello, world.",
    ]);
  });

  it("backtick quoted string with variable pattern", () => {
    assert.deepEqual(backtickQuoteString("`$x.json`").value, [
      opcodes.quote,
      [opcodes.variable, "x", ".json"],
    ]);
    assert.deepEqual(backtickQuoteString("`foo $x.json bar`").value, [
      opcodes.quote,
      "foo ",
      [opcodes.variable, "x", ".json"],
      " bar",
    ]);
  });

  it("function call with variable pattern", () => {
    assert.deepEqual(functionCall("fn($name.json)").value, [
      [opcodes.get, "fn"],
      [[opcodes.variable, "name", ".json"]],
    ]);
  });

  it("expression", () => {
    assert.deepEqual(expression("(fn a, b, c)").value, [
      [opcodes.get, "fn"],
      [[opcodes.get, "a"]],
      [[opcodes.get, "b"]],
      [[opcodes.get, "c"]],
    ]);
    assert.deepEqual(expression("foo.bar( 'hello' , 'world' )").value, [
      [opcodes.get, "foo.bar"],
      [opcodes.quote, "hello"],
      [opcodes.quote, "world"],
    ]);
    assert.deepEqual(expression("(fn)('a')").value, [
      [[opcodes.get, "fn"]],
      [opcodes.quote, "a"],
    ]);
    assert.equal(expression("(foo").value, undefined);
  });

  it("slash-delimited path", () => {
    assert.deepEqual(slashPath("foo/bar/baz").value, [
      [opcodes.quote, "foo"],
      [opcodes.quote, "bar"],
      [opcodes.quote, "baz"],
    ]);
  });

  it("function call with path syntax", () => {
    assert.deepEqual(slashCall("fn/a/b/c").value, [
      [opcodes.get, "fn"],
      [opcodes.quote, "a"],
      [opcodes.quote, "b"],
      [opcodes.quote, "c"],
    ]);
    assert.deepEqual(slashCall("about:blank").value, [
      [opcodes.get, "about"],
      [opcodes.quote, "blank"],
    ]);
    assert.deepEqual(slashCall("https://example.com/foo/bar.json").value, [
      [opcodes.get, "https"],
      [opcodes.quote, "example.com"],
      [opcodes.quote, "foo"],
      [opcodes.quote, "bar.json"],
    ]);
  });

  it("space-delimited url", () => {
    assert.deepEqual(spaceUrl("https example.com foo bar.json").value, [
      [opcodes.get, "https"],
      [opcodes.quote, "example.com"],
      [opcodes.quote, "foo"],
      [opcodes.quote, "bar.json"],
    ]);
    assert.deepEqual(spaceUrl("http example.org $x data.json").value, [
      [opcodes.get, "http"],
      [opcodes.quote, "example.org"],
      [opcodes.variable, "x", null],
      [opcodes.quote, "data.json"],
    ]);
  });

  it("assignment", () => {
    assert.deepEqual(assignment("foo = fn 'bar'").value, [
      "=",
      "foo",
      [
        [opcodes.get, "fn"],
        [opcodes.quote, "bar"],
      ],
    ]);
  });

  it("assignment with ƒ on right-hand side", () => {
    assert.deepEqual(assignment("foo = ƒ.json").value, [
      "=",
      "foo",
      [[opcodes.get, "foo = ƒ.json"]],
    ]);
    assert.deepEqual(assignment("foo = ƒ().js").value, [
      "=",
      "foo",
      [[opcodes.get, "foo = ƒ().js"]],
    ]);
    assert.deepEqual(assignment("foo = ƒ('bar').js").value, [
      "=",
      "foo",
      [
        [opcodes.get, "foo = ƒ('bar').js"],
        [opcodes.quote, "bar"],
      ],
    ]);
  });

  it("assignment to splat on left with ƒ on right", () => {
    assert.deepEqual(assignment("...graph = ƒ().js").value, [
      "=",
      "...graph",
      [[opcodes.get, "...graph = ƒ().js"]],
    ]);
  });

  it("assignment with variable pattern", () => {
    assert.deepEqual(assignment("{name}.html = foo($name.json)").value, [
      "=",
      [opcodes.variable, "name", ".html"],
      [[opcodes.get, "foo"], [[opcodes.variable, "name", ".json"]]],
    ]);
  });

  it("key", () => {
    assert.deepEqual(key("foo").value, [opcodes.get, "foo"]);
    assert.deepEqual(key("{name}.yaml").value, [
      opcodes.variable,
      "name",
      ".yaml",
    ]);
    assert.deepEqual(key("{x}.html = marked $x.md").value, [
      "=",
      [opcodes.variable, "x", ".html"],
      [[opcodes.get, "marked"], [[opcodes.variable, "x", ".md"]]],
    ]);
  });
});
