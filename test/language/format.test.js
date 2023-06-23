import assert from "node:assert";
import { describe, test } from "node:test";
import format from "../../src/language/format.js";
import * as ops from "../../src/language/ops.js";

describe("Origami language code formatter", () => {
  test("assignment", () => {
    const code = [ops.assign, "foo", [ops.scope, "bar"]];
    assert.equal(format(code), "foo = bar");
  });

  test("scope reference", () => {
    const code = [ops.scope, "foo"];
    assert.equal(format(code), "foo");
  });

  // TODO: Implicit funtion invocation only applies to rightmost arg.
  test("implicit function call", () => {
    const code = [ops.scope, "foo"];
    assert.equal(format(code, true), "foo()");
  });

  test("graph traversal with string args", () => {
    const code = [ops.scope, "a", "b", "c"];
    assert.equal(format(code), "a/b/c");
  });

  test("graph traversal with numeric and string args", () => {
    const code = [ops.scope, "fn", "x", 1, 2];
    assert.equal(format(code), "fn('x', 1, 2)");
  });

  test("graph traversal with function arg and string arg", () => {
    const code = [ops.scope, "fn", [ops.scope, "foo"], "bar"];
    assert.equal(format(code), "fn(foo, 'bar')");
  });

  test("function composition", () => {
    const code = [[[ops.scope, "fn"], "a"], "b"];
    assert.equal(format(code), "fn('a')('b')");
  });

  test("graph", () => {
    const code = [ops.graph, { x: [[ops.scope, "fn"]] }];
    assert.equal(format(code), "{ x = fn() }");
  });

  test("lambda", () => {
    const code = [ops.lambda, [ops.scope, "message"]];
    assert.equal(format(code), "=message");
  });

  test("object", () => {
    const code = [ops.object, { a: "Hello", b: "Goodbye" }];
    assert.equal(format(code), "{ a: 'Hello', b: 'Goodbye' }");
  });

  test("template", () => {
    const code = [ops.concat, "Hello, ", [ops.scope, "name"], "."];
    assert.equal(format(code), "`Hello, {{name}}.`");
  });

  test("this", () => {
    const code = [ops.thisKey];
    assert.equal(format(code), "this");
  });
});
