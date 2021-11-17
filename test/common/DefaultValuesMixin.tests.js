import DefaultValuesMixin from "../../src/common/DefaultValuesMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe.skip("DefaultValuesMixin", () => {
  it("provides default values for missing keys at any point in graph", async () => {
    const graph = new (DefaultValuesMixin(ExplorableObject))({
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
    assert.deepEqual(await ExplorableGraph.keys(graph), ["a", "b", "more"]);

    assert.equal(await graph.get("a"), 1);
    assert.equal(await graph.get("b"), 2); // Respects main graph
    assert.equal(await graph.get("d"), 5); // Default
    assert.equal(await ExplorableGraph.traverse(graph, "more", "b"), 4); // Default
    assert.equal(await ExplorableGraph.traverse(graph, "more", "c"), 3);
    assert.equal(await ExplorableGraph.traverse(graph, "more", "d"), 5); // Default
  });
});
