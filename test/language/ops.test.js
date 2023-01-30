import ObjectGraph from "../../src/core/ObjectGraph.js";
import OrigamiGraph from "../../src/framework/OrigamiGraph.js";
import execute from "../../src/language/execute.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

describe.only("ops", () => {
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
});
