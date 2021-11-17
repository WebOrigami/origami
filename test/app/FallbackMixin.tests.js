import FallbackMixin from "../../src/app/FallbackMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("FallbackMixin", () => {
  it.only("defines fallback content with + key", async () => {
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
    const plain = await ExplorableGraph.plain(graph);
    assert.deepEqual(plain, {
      "+": {
        b: "+b",
      },
      a: {
        "+": {
          c: "+c",
        },
        a1: "a1",
        subgraph: {
          a2: "a2",
          b: "+b",
          c: "+c",
        },
        b: "+b",
        c: "+c",
      },
      b: "+b",
    });
  });
});
