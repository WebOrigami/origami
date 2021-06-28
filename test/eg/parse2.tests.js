import {
  args,
  doubleQuoteString,
  expression,
  functionCall,
  group,
  indirectCall,
  list,
  optionalWhitespace,
  reference,
  singleQuoteString,
  statement,
} from "../../src/eg/parse2.js";
import assert from "../assert.js";

describe("parse2", () => {
  it("whitespace", () => {
    assert.deepEqual(optionalWhitespace("   hello"), {
      value: null,
      rest: "hello",
    });
  });

  it("reference", () => {
    assert.deepEqual(reference("hello"), {
      value: "hello",
      rest: "",
    });
    assert.equal(reference("").value, undefined);
    assert.equal(reference("()").value, undefined);
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
    assert.deepEqual(list(`"foo", "bar"`).value, ["foo", "bar"]);
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
    assert.deepEqual(doubleQuoteString(`"hello"`).value, "hello");
  });

  it("single-quote string", () => {
    assert.deepEqual(singleQuoteString(`'hello'`).value, "hello");
  });

  it("function call", () => {
    assert.deepEqual(functionCall("fn"), {
      value: ["fn"],
      rest: "",
    });
    assert.deepEqual(functionCall("fn('a', 'b')"), {
      value: ["fn", "a", "b"],
      rest: "",
    });
    assert.deepEqual(functionCall("fn 'a', 'b'"), {
      value: ["fn", "a", "b"],
      rest: "",
    });
    assert.deepEqual(functionCall("fn a, b"), {
      value: ["fn", ["a"], ["b"]],
      rest: "",
    });
  });

  it("group", () => {
    assert.deepEqual(group(" ( hello )").value, ["hello"]);
    assert.deepEqual(group("(((nested)))").value, ["nested"]);
    assert.equal(group("(").value, undefined);
  });

  it("indirect function call", () => {
    assert.deepEqual(indirectCall("(fn) 'a'").value, [["fn"], "a"]);
    assert.deepEqual(indirectCall("(fn) ('a', 'b')").value, [["fn"], "a", "b"]);
    assert.deepEqual(indirectCall("(fn)").value, undefined);
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
      "hello",
      "world",
    ]);
    assert.deepEqual(expression("(fn)('a')").value, [["fn"], "a"]);
    assert.equal(expression("(foo").value, undefined);
  });

  it("assignment", () => {
    assert.deepEqual(statement("foo = fn 'bar'").value, [
      "=",
      "foo",
      ["fn", "bar"],
    ]);
  });

  it("statement", () => {
    assert.deepEqual(statement("fn('foo')").value, ["fn", "foo"]);
    assert.deepEqual(statement("foo = bar").value, ["=", "foo", ["bar"]]);
  });
});
