import {
  args,
  assignment,
  doubleQuoteString,
  expression,
  functionCall,
  group,
  identifier,
  indirectCall,
  list,
  optionalWhitespace,
  pattern,
  singleQuoteString,
  statement,
  variableMarker,
} from "../../src/eg/parse.js";
import assert from "../assert.js";

describe("parse", () => {
  it("whitespace", () => {
    assert.deepEqual(optionalWhitespace("   hello"), {
      value: null,
      rest: "hello",
    });
  });

  it("identifier", () => {
    assert.deepEqual(identifier("hello"), {
      value: "hello",
      rest: "",
    });
    assert.equal(identifier("").value, undefined);
    assert.equal(identifier("()").value, undefined);
  });

  it("list", () => {
    assert.equal(list("").value, undefined);
    assert.deepEqual(list(" a"), {
      value: [["a"]],
      rest: "",
    });
    assert.deepEqual(list(" a , b,c, d , e").value, [
      ["a"],
      ["b"],
      ["c"],
      ["d"],
      ["e"],
    ]);
    assert.deepEqual(list(`"foo", "bar"`).value, [
      ["quote", "foo"],
      ["quote", "bar"],
    ]);
    assert.deepEqual(list("a(b), c").value, [["a", ["b"]], ["c"]]);
  });

  it("args", () => {
    assert.deepEqual(args("a, b, c"), {
      value: [["a"], ["b"], ["c"]],
      rest: "",
    });
    assert.deepEqual(args("(a, b, c)"), {
      value: [["a"], ["b"], ["c"]],
      rest: "",
    });
    assert.deepEqual(args("()").value, []);
    assert.deepEqual(args("").value, undefined);
  });

  it("double-quote string", () => {
    assert.deepEqual(doubleQuoteString(`"hello"`).value, ["quote", "hello"]);
  });

  it("single-quote string", () => {
    assert.deepEqual(singleQuoteString(`'hello'`).value, ["quote", "hello"]);
  });

  it("function call", () => {
    assert.deepEqual(functionCall("fn"), {
      value: ["fn"],
      rest: "",
    });
    assert.deepEqual(functionCall("fn('a', 'b')"), {
      value: ["fn", ["quote", "a"], ["quote", "b"]],
      rest: "",
    });
    assert.deepEqual(functionCall("fn 'a', 'b'"), {
      value: ["fn", ["quote", "a"], ["quote", "b"]],
      rest: "",
    });
    assert.deepEqual(functionCall("fn a, b"), {
      value: ["fn", ["a"], ["b"]],
      rest: "",
    });
    assert.deepEqual(functionCall("fn a(b), c"), {
      value: ["fn", ["a", ["b"]], ["c"]],
      rest: "",
    });
  });

  it("group", () => {
    assert.deepEqual(group(" ( hello )").value, ["hello"]);
    assert.deepEqual(group("(((nested)))").value, ["nested"]);
    assert.equal(group("(").value, undefined);
  });

  it("indirect function call", () => {
    assert.deepEqual(indirectCall("(fn) 'a'").value, [["fn"], ["quote", "a"]]);
    assert.deepEqual(indirectCall("(fn) (a, b)").value, [["fn"], ["a"], ["b"]]);
    assert.deepEqual(indirectCall("(fn)").value, undefined);
  });

  it("variable pattern", () => {
    assert.deepEqual(pattern("{name}").value, [
      variableMarker,
      "name",
      null,
      null,
    ]);
    assert.deepEqual(pattern("{name}.json").value, [
      variableMarker,
      "name",
      null,
      ".json",
    ]);
  });

  it("function call with variable pattern", () => {
    assert.deepEqual(functionCall("fn({name}.json)").value, [
      "fn",
      [[variableMarker, "name", null, ".json"]],
    ]);
  });

  it("expression", () => {
    assert.deepEqual(expression("(fn a, b, c)").value, [
      "fn",
      ["a"],
      ["b"],
      ["c"],
    ]);
    assert.deepEqual(expression("foo.bar( 'hello' , 'world' )").value, [
      "foo.bar",
      ["quote", "hello"],
      ["quote", "world"],
    ]);
    assert.deepEqual(expression("(fn)('a')").value, [["fn"], ["quote", "a"]]);
    assert.equal(expression("(foo").value, undefined);
  });

  it("assignment", () => {
    assert.deepEqual(assignment("foo = fn 'bar'").value, [
      "=",
      "foo",
      ["fn", ["quote", "bar"]],
    ]);
  });

  it("assignment with ƒ on right-hand side", () => {
    assert.deepEqual(assignment("foo = ƒ.json").value, [
      "=",
      "foo",
      "foo = ƒ.json",
    ]);
    assert.deepEqual(assignment("foo = ƒ().js").value, [
      "=",
      "foo",
      "foo = ƒ().js",
    ]);
    assert.deepEqual(assignment("foo = ƒ('bar').js").value, [
      "=",
      "foo",
      ["foo = ƒ('bar').js", ["quote", "bar"]],
    ]);
  });

  it("assignment to splat on left with ƒ on right", () => {
    assert.deepEqual(assignment("...graph = ƒ().js").value, [
      "=",
      "...graph",
      "...graph = ƒ().js",
    ]);
  });

  it("assignment with variable pattern", () => {
    assert.deepEqual(assignment("{name}.html = foo({name}.json)").value, [
      "=",
      [variableMarker, "name", null, ".html"],
      ["foo", [[variableMarker, "name", null, ".json"]]],
    ]);
  });

  it("statement", () => {
    assert.deepEqual(statement("fn('foo')").value, ["fn", ["quote", "foo"]]);
    assert.deepEqual(statement("foo = bar").value, ["=", "foo", ["bar"]]);
  });
});
