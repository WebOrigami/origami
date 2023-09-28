import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import Scope from "../../src/common/Scope.js";
import OrigamiGraph from "../../src/framework/OrigamiGraph.js";
import execute from "../../src/language/execute.js";
import { createExpressionFunction } from "../../src/language/expressionFunction.js";
import * as ops from "../../src/language/ops.js";

describe("ops", () => {
  test("can resolve substitutions in a template literal", async () => {
    const scope = new ObjectGraph({
      name: "world",
    });

    const code = [ops.concat, "Hello, ", [ops.scope, "name"], "."];

    const result = await execute.call(scope, code);
    assert.equal(result, "Hello, world.");
  });

  test("can invoke a lambda", async () => {
    const scope = new ObjectGraph({
      message: "Hello",
    });

    const code = [ops.lambda, [ops.scope, "message"]];

    const fn = await execute.call(scope, code);
    const result = await fn.call(scope);
    assert.equal(result, "Hello");
  });

  test("lambda adds input to scope as `.`", async () => {
    const code = [ops.lambda, [ops.scope, "."]];
    const fn = await execute.call(null, code);
    const result = await fn("Hello");
    assert.equal(result, "Hello");
  });

  test("lambda adds input to scope as `@input`", async () => {
    const code = [ops.lambda, [ops.scope, "@input"]];
    const fn = await execute.call(null, code);
    const result = await fn("Hello");
    assert.equal(result, "Hello");
  });

  test("a lambda can reference itself with @recurse", async () => {
    const code = [ops.lambda, [ops.scope, "@recurse"]];
    const fn = await execute.call(null, code);
    const result = await fn();
    assert.equal(result, fn);
  });

  test("can instantiate an object", async () => {
    const scope = new ObjectGraph({
      upper: (s) => s.toUpperCase(),
    });

    const code = [
      ops.object,
      {
        hello: [[ops.scope, "upper"], "hello"],
        world: [[ops.scope, "upper"], "world"],
      },
    ];

    const result = await execute.call(scope, code);
    assert.equal(result.hello, "HELLO");
    assert.equal(result.world, "WORLD");
  });

  test("can instantiate an array", async () => {
    const scope = new ObjectGraph({
      upper: (s) => s.toUpperCase(),
    });
    const code = [ops.array, "Hello", 1, [[ops.scope, "upper"], "world"]];
    const result = await execute.call(scope, code);
    assert.deepEqual(result, ["Hello", 1, "WORLD"]);
  });

  test("can instantiate an Origami graph", async () => {
    const code = [
      ops.graph,
      {
        name: "world",
        message: createExpressionFunction([
          ops.concat,
          "Hello, ",
          [ops.scope, "name"],
          "!",
        ]),
      },
    ];
    const result = await execute.call({}, code);
    assert(result instanceof OrigamiGraph);
    assert.deepEqual(await Graph.plain(result), {
      name: "world",
      message: "Hello, world!",
    });
  });

  test("can search inherited scope", async () => {
    const a = new ObjectGraph({
      a: 1, // This is the inherited value we want
    });
    /** @type {any} */
    const b = new ObjectGraph({
      a: 2, // Should be ignored
    });
    b.scope = new Scope(b, a);
    const code = [ops.inherited, "a"];
    const result = await execute.call(b.scope, code);
    assert.equal(result, 1);
  });
});
