import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import MapValuesGraph from "../../src/core/MapValuesGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("MapValuesGraph", () => {
  it("applies a mapping function to values", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const doubled = new MapValuesGraph(graph, (value) => 2 * value, {
      deep: true,
    });
    const plain = await ExplorableGraph.plain(doubled);
    assert.deepEqual(plain, {
      a: 2,
      b: 4,
      c: 6,
      more: {
        d: 8,
        e: 10,
      },
    });
  });
});
