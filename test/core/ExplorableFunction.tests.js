import ExplorableFunction from "../../src/core/ExplorableFunction.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("ExplorableFunction", () => {
  it("constructs an explorable function", async () => {
    const graph = new ExplorableFunction(
      (key) => `Hello, ${key}.`,
      ["a", "b", "c"]
    );

    // Can get values for all defined keys.
    const plain = await ExplorableGraph.plain(graph);
    assert.deepEqual(plain, {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });

    // Can also get values for other keys.
    assert.equal(await graph.get("d"), "Hello, d.");
  });

  it("get returns 'this' if no keys are provided", async () => {
    const graph = new ExplorableFunction(
      (key) => `Hello, ${key}.`,
      ["a", "b", "c"]
    );
    const result = await graph.get();
    assert.equal(result, graph);
  });
});
