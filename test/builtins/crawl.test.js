import crawl from "../../src/builtins/crawl.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("crawl", () => {
  it("finds linked pages", async () => {
    const graph = {
      "index.html": `
        <a href="about.html">About</a>
        <a href="https://example.com">External</a>
      `,
      "about.html": "About page",
    };
    const crawled = await crawl(graph);
    assert.deepEqual(await ExplorableGraph.keys(crawled), [
      "index.html",
      "about.html",
    ]);
  });
});
