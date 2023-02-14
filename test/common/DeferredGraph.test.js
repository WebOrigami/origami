import DeferredGraph from "../../src/common/DeferredGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("DeferredGraph", () => {
  it("Loads graph lazily", async () => {
    const graph = new DeferredGraph(async () => {
      return new ObjectGraph({
        a: 1,
        b: 2,
      });
    });
    assert(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
    });
  });
});
