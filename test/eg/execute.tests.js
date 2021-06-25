import ExplorableObject from "../../src/core/ExplorableObject.js";
import execute from "../../src/eg/execute.js";
import assert from "../assert.js";

describe("execute", () => {
  it("can execute", async () => {
    // Match array format from parse/link.
    async function greet(name) {
      return `Hello ${name}`;
    }
    const linked = [greet, "world"];
    const result = await execute(linked);
    assert.equal(result, "Hello world");
  });

  it("can use `this` to reference the current graph", async () => {
    const linked = ["this"];
    const graph = new ExplorableObject({});
    const result = await execute(linked, graph);
    assert.equal(result, graph);
  });
});
