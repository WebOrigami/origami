import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ArrowGraph from "../../src/framework/ArrowGraph.js";
import assert from "../assert.js";

describe("ArrowGraph", () => {
  it("interprets ← in a key as a function call", async () => {
    const graph = new ArrowGraph({
      "index.html ← .ori": "<h1>{{ title }}</h1>",
      title: "Our Site",
    });
    assert(await ExplorableGraph.plain(graph), {
      "index.html": "<h1>Our Site</h1>",
      title: "Our Site",
    });
  });
});
