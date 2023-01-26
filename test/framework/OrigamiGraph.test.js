import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import OrigamiGraph from "../../src/framework/OrigamiGraph.js";
import assert from "../assert.js";

describe("OrigamiGraph", () => {
  it("graph from text", async () => {
    const graph = new OrigamiGraph(`
      name: 'world'
      message = \`Hello, {{ name }}!\`
    `);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      name: "world",
      message: "Hello, world!",
    });
  });

  it("graph can contain nested graph", async () => {
    const graph = new OrigamiGraph(`
      public: {
        index.html: 'Hello'
      }
    `);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      public: {
        "index.html": "Hello",
      },
    });
    const indexHtml = await ExplorableGraph.traverse(
      graph,
      "public",
      "index.html"
    );
    assert.equal(indexHtml, "Hello");
  });
});
