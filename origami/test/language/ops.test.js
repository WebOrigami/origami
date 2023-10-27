import { ObjectTree, Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import execute from "../../src/language/execute.js";
import { createExpressionFunction } from "../../src/language/expressionFunction.js";
import * as ops from "../../src/language/ops.js";
import OrigamiTree from "../../src/runtime/OrigamiTree.js";
import Scope from "../../src/runtime/Scope.js";

describe("ops", () => {
  test("can resolve substitutions in a template literal", async () => {
    const scope = new ObjectTree({
      name: "world",
    });

    const code = [ops.concat, "Hello, ", [ops.scope, "name"], "."];

    const result = await execute.call(scope, code);
    assert.equal(result, "Hello, world.");
  });

  test("can invoke a lambda", async () => {
    const scope = new ObjectTree({
      message: "Hello",
    });

    const code = [ops.lambda, [ops.scope, "message"]];

    const fn = await execute.call(scope, code);
    const result = await fn.call(scope);
    assert.equal(result, "Hello");
  });

  test("lambda adds input to scope as `_`", async () => {
    const code = [ops.lambda, [ops.scope, "_"]];
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
    const scope = new ObjectTree({
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
    const scope = new ObjectTree({
      upper: (s) => s.toUpperCase(),
    });
    const code = [ops.array, "Hello", 1, [[ops.scope, "upper"], "world"]];
    const result = await execute.call(scope, code);
    assert.deepEqual(result, ["Hello", 1, "WORLD"]);
  });

  test("can instantiate an Origami tree", async () => {
    const code = [
      ops.tree,
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
    assert(result instanceof OrigamiTree);
    assert.deepEqual(await Tree.plain(result), {
      name: "world",
      message: "Hello, world!",
    });
  });

  test("can search inherited scope", async () => {
    const a = new ObjectTree({
      a: 1, // This is the inherited value we want
    });
    /** @type {any} */
    const b = new ObjectTree({
      a: 2, // Should be ignored
    });
    b.scope = new Scope(b, a);
    const code = [ops.inherited, "a"];
    const result = await execute.call(b.scope, code);
    assert.equal(result, 1);
  });
});
