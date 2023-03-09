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

  it("finds linked images", async () => {
    const graph = {
      "index.html": `<img src="logo.png">`,
      "logo.png": "PNG data",
    };
    const crawled = await crawl(graph);
    assert.deepEqual(await ExplorableGraph.keys(crawled), [
      "index.html",
      "logo.png",
    ]);
  });

  it("finds linked JavaScript files", async () => {
    const graph = {
      "index.html": `
        <script src="a.js" type="module"></script>
      `,
      "a.js": "import b from './b.js';",
      "b.js": "export default true;",
    };
    const crawled = await crawl(graph);
    assert.deepEqual(await ExplorableGraph.keys(crawled), [
      "index.html",
      "a.js",
      "b.js",
    ]);
  });
});
