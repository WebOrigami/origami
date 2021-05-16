import chai from "chai";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import evaluate from "../../src/eg/evaluate.js";
const { assert } = chai;

describe("evaluate", () => {
  it("can parse, link, and execute", async () => {
    const source = "greet(world)";
    const scope = new ExplorableGraph({
      async greet(name) {
        return `Hello ${name}`;
      },
    });
    const result = await evaluate(source, scope, "world");
    assert.equal(result, "Hello world");
  });
});
