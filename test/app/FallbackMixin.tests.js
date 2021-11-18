import FallbackMixin from "../../src/app/FallbackMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("FallbackMixin", () => {
  it("defines fallback content with + key", async () => {
    const graph = new (FallbackMixin(ExplorableObject))({
      "+": {
        // Define `b` as fallback content.
        b: "+b",
      },
      a: {
        "+": {
          // Define `c` as fallback content.
          c: "+c",
        },
        a1: "a1",
        subgraph: {
          a2: "a2",
        },
      },
    });

    // Fallback keys are not included.
    assert.deepEqual(await ExplorableGraph.keys(graph), ["+", "a"]);

    // But fallback values are available.
    assert.deepEqual(await graph.get("b"), "+b");

    // Fallback values are inherited.
    assert.deepEqual(
      await ExplorableGraph.traverse(graph, "a", "subgraph", "b"),
      "+b"
    );
    assert.deepEqual(
      await ExplorableGraph.traverse(graph, "a", "subgraph", "c"),
      "+c"
    );
  });
});
