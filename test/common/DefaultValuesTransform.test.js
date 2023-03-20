import DefaultValuesTransform from "../../src/common/DefaultValuesTransform.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("DefaultValuesTransform", () => {
  it("provides default values for missing keys at any point in graph", async () => {
    const graph = new (DefaultValuesTransform(ObjectGraph))({
      a: 1,
      b: 2,
      more: {
        c: 3,
      },
    });
    graph.defaults = {
      b: 4,
      d: 5,
    };

    // Default values don't show up in keys
    assert.deepEqual(Array.from(await graph.keys()), ["a", "b", "more"]);

    assert.equal(await graph.get("a"), 1);
    assert.equal(await graph.get("b"), 2); // Respects main graph
    assert.equal(await graph.get("d"), 5); // Default
    assert.equal(await ExplorableGraph.traverse(graph, "more", "b"), 4); // Default
    assert.equal(await ExplorableGraph.traverse(graph, "more", "c"), 3);
    assert.equal(await ExplorableGraph.traverse(graph, "more", "d"), 5); // Default
  });

  it("invokes a default value function", async () => {
    const graph = new (DefaultValuesTransform(ObjectGraph))({
      a: 1,
      more: {
        b: 2,
      },
    });
    graph.defaults = {
      c: () => 3,
    };
    assert.equal(await graph.get("c"), 3);
    assert.equal(await ExplorableGraph.traverse(graph, "more", "c"), 3);
  });
});
