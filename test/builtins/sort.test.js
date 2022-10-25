import sort from "../../src/builtins/sort.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("sort", () => {
  it("sorts keys", async () => {
    const graph = {
      b: 2,
      c: 3,
      a: 1,
    };
    const sorted = await sort(graph);
    assert.deepEqual(await ExplorableGraph.keys(sorted), ["a", "b", "c"]);
  });
});
