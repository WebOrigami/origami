import ExplorableObject from "../../src/core/ExplorableObject.js";
import execute from "../../src/eg/execute.js";
import * as opcodes from "../../src/eg/opcodes.js";
import assert from "../assert.js";

describe("execute", () => {
  it("can execute", async () => {
    // Match array format from parse/link.
    const parsed = [
      [opcodes.get, "greet"],
      [opcodes.get, "name"],
    ];
    const scope = new ExplorableObject({
      async greet(name) {
        return `Hello ${name}`;
      },
    });
    const graph = new ExplorableObject({
      name: "world",
    });
    const result = await execute(parsed, scope, graph);
    assert.equal(result, "Hello world");
  });

  it.skip("can use `this` to reference the current graph", async () => {
    const parsed = ["this"];
    const scope = new ExplorableObject({});
    const graph = new ExplorableObject({});
    const result = await execute(parsed, scope, graph);
    assert.equal(result, graph);
  });
});
