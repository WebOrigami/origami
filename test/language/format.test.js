import format from "../../src/language/format.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

describe.only("Origami language code formatter", () => {
  it("scope reference", () => {
    const code = [ops.scope, "foo"];
    assert.equal(format(code), "foo");
  });

  // TODO: Implicit funtion invocation only applies to rightmost arg.
  it("implicit function call", () => {
    const code = [ops.scope, "foo"];
    assert.equal(format(code, true), "foo()");
  });

  it("graph traversal with string args", () => {
    const code = [ops.scope, "a", "b", "c"];
    assert.equal(format(code), "a/b/c");
  });

  it("graph traversal with numeric and string args", () => {
    const code = [ops.scope, "fn", "x", 1, 2];
    assert.equal(format(code), "fn('x', 1, 2)");
  });

  it("graph traversal with function arg and string arg", () => {
    const code = [ops.scope, "fn", [ops.scope, "foo"], "bar"];
    assert.equal(format(code), "fn(foo, 'bar')");
  });

  it("function composition", () => {
    const code = [[[ops.scope, "fn"], "a"], "b"];
    assert.equal(format(code), "fn('a')('b')");
  });

  it("lambda", () => {
    const code = [ops.lambda, [ops.scope, "message"]];
    assert.equal(format(code), "=message");
  });

  it("object", () => {
    const code = [ops.object, { a: "Hello", b: "Goodbye" }];
    assert.equal(format(code), "{ a: 'Hello' b: 'Goodbye' }");
  });

  it("template", () => {
    const code = [ops.concat, "Hello, ", [ops.scope, "name"], "."];
    assert.equal(format(code), "`Hello, {{name}}.`");
  });

  it("this", () => {
    const code = [ops.thisKey];
    assert.equal(format(code), "this");
  });

  it("assignment", () => {
    const code = ["=", "foo", [ops.scope, "bar"]];
    assert.equal(format(code), "foo = bar");
  });
});
