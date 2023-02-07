import Scope from "../../src/common/Scope.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import OrigamiGraph from "../../src/framework/OrigamiGraph.js";
import execute from "../../src/language/execute.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

describe("ops", () => {
  it("can resolve substitutions in a template literal", async () => {
    const scope = new ObjectGraph({
      name: "world",
    });

    const code = [ops.concat, "Hello, ", [ops.scope, "name"], "."];

    const result = await execute.call(scope, code);
    assert.equal(result, "Hello, world.");
  });

  it("can invoke a lambda", async () => {
    const scope = new ObjectGraph({
      name: "world",
    });

    const code = [
      ops.lambda,
      [ops.concat, "Hello, ", [ops.scope, "name"], "."],
    ];

    const fn = await execute.call(scope, code);
    const result = await fn.call(scope);
    assert.equal(result, "Hello, world.");
  });

  it("can instantiate an object", async () => {
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
    assert.deepEqual(result, {
      hello: "HELLO",
      world: "WORLD",
    });
  });

  it("can instantiate an array", async () => {
    const scope = new ObjectGraph({
      upper: (s) => s.toUpperCase(),
    });
    const code = [ops.array, "Hello", 1, [[ops.scope, "upper"], "world"]];
    const result = await execute.call(scope, code);
    assert.deepEqual(result, ["Hello", 1, "WORLD"]);
  });

  it("can instantiate an Origami graph", async () => {
    const code = [
      ops.graph,
      {
        name: "world",
        message: [ops.concat, "Hello, ", [ops.scope, "name"], "!"],
      },
    ];
    const result = await execute.call({}, code);
    assert(result instanceof OrigamiGraph);
    assert.deepEqual(result.formulas, {
      name: "world",
      message: [ops.concat, "Hello, ", [ops.scope, "name"], "!"],
    });
  });

  it("can search inherited scope", async () => {
    const a = new ObjectGraph({
      a: 1, // This is the inherited value we want
    });
    const b = new ObjectGraph({
      a: 2, // Should be ignored
    });
    /** @type {any} */ (b).scope = new Scope(b, a);
    const code = [ops.inherited, "a"];
    const result = await execute.call(b.scope, code);
    assert.equal(result, 1);
  });
});
