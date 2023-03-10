import ExplorableSiteTransform from "../../src/common/ExplorableSiteTransform.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("ExplorableSiteTransform", () => {
  it.skip("treats an undefined key at the end of a traversal as index.html", async () => {
    const graph = new (ExplorableSiteTransform(ObjectGraph))({
      foo: {
        bar: {
          "index.html": "Index",
        },
      },
    });
    const value = await ExplorableGraph.traverse(graph, [
      "foo",
      "bar",
      undefined,
    ]);
    assert.equal(value, "Index");
  });
});
