import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import execute from "../../src/language/execute.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

describe("ops", () => {
  it("can resolve substitutions in a template literal", async () => {
    const graph = new ExplorableObject({
      name: "world",
    });

    const code = [ops.concat, "Hello, ", [ops.scope, "name"], "."];

    const result = await execute.call(graph, code);
    assert.equal(result, "Hello, world.");
  });

  it("can invoke a lambda", async () => {
    const graph = new ExplorableObject({
      name: "world",
    });

    const code = [
      ops.lambda,
      [ops.concat, "Hello, ", [ops.scope, "name"], "."],
    ];

    const fn = await execute.call(graph, code);
    const result = await fn(graph);
    assert.equal(result, "Hello, world.");
  });

  it("lambda extends scope of value passed to it", async () => {
    const graph = new ExplorableObject({
      a: "Defined by graph",
    });
    const key = "key";
    const value = {
      b: "Defined by value",
    };

    const fnA = ops.lambda([ops.scope, "a"]);
    const resultA = await fnA.call(graph, value, key);
    assert.equal(resultA, "Defined by graph");

    const fnB = ops.lambda([ops.scope, "b"]);
    const resultB = await fnB.call(graph, value, key);
    assert.equal(resultB, "Defined by value");

    const fnKey = ops.lambda([ops.scope, "@key"]);
    const resultKey = await fnKey.call(graph, value, key);
    assert.equal(resultKey, "key");

    const fnValue = ops.lambda([ops.scope, "@value"]);
    const resultValue = await fnValue.call(graph, value, key);
    const resultPlain = await ExplorableGraph.plain(resultValue);
    assert.deepEqual(resultPlain, value);
  });
});
