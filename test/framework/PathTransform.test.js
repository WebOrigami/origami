import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import PathTransform from "../../src/framework/PathTransform.js";
import assert from "../assert.js";

describe("PathTransform", () => {
  it("defines an ambient @path value for explorable results", async () => {
    const graph = new (PathTransform(ObjectGraph))({
      a: {
        b: {
          c: {},
        },
      },
    });
    const result = await ExplorableGraph.traverse(graph, "a", "b", "c");
    const path = await result.get("@path");
    assert.equal(path, "a/b/c");
  });
});
