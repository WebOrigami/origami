import ExplorableObject from "../../src/core/ExplorableObject.js";
import evaluate from "../../src/eg/evaluate.js";
import assert from "../assert.js";

describe.skip("evaluate", () => {
  it("can parse, link, and execute", async () => {
    const source = `greet("world")`;
    const scope = new ExplorableObject({
      async greet(name) {
        return `Hello ${name}`;
      },
    });
    const graph = new ExplorableObject({});
    const result = await evaluate(source, scope, graph);
    assert.equal(result, "Hello world");
  });
});
