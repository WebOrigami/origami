import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import FunctionGraph from "../../src/core/FunctionGraph.js";
import assert from "../assert.js";

describe("FunctionGraph", () => {
  it("constructs an explorable function", async () => {
    const graph = new FunctionGraph((key) => `Hello, ${key}.`, ["a", "b", "c"]);

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

  it("get executes if no keys are provided", async () => {
    const graph = new FunctionGraph(() => `Hello.`, ["a", "b", "c"]);
    const result = await graph.get(undefined);
    assert.equal(result, "Hello.");
  });

  it("get curries a multi-argument function", async () => {
    const graph = new FunctionGraph((a, b) => a + b);
    const twoPlus = await graph.get(2);
    const twoPlusThree = await twoPlus.get(3);
    assert.equal(twoPlusThree, 5);
  });

  it("can traverse a function with a spread parameter", async () => {
    const graph = new FunctionGraph((...args) => args.join(", "));
    const result = await ExplorableGraph.traverse(graph, "a", "b", "c");
    assert.equal(result, "a, b, c");
  });
});
