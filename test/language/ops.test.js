import ExplorableObject from "../../src/core/ExplorableObject.js";
import execute from "../../src/language/execute.js";
import * as ops from "../../src/language/ops.js";
import assert from "../assert.js";

describe("ops", () => {
  it("can resolve substitutions in a template literal", async () => {
    const scope = new ExplorableObject({
      name: "world",
    });

    const code = [ops.concat, "Hello, ", [ops.scope, "name"], "."];

    const result = await execute.call(scope, code);
    assert.equal(result, "Hello, world.");
  });

  it("can invoke a lambda", async () => {
    const scope = new ExplorableObject({
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
});
