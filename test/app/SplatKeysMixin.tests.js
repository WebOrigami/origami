import SplatKeysMixin from "../../src/app/SplatKeysMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe.only("SplatKeysMixin", () => {
  it("treats values inside subgraphs marked by `...` splat keys as if part of main graph", async () => {
    const graph = new (SplatKeysMixin(ExplorableObject))({
      a: 1,
      "...": new ExplorableObject({
        b: 2,
        c: 3,
      }),
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
      c: 3,
    });
  });
});
