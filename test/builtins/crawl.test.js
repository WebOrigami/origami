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
    const crawled = await crawl.call(null, graph);
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
    const crawled = await crawl.call(null, graph);
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
    const crawled = await crawl.call(null, graph);
    assert.deepEqual(await ExplorableGraph.keys(crawled), [
      "index.html",
      "a.js",
      "b.js",
    ]);
  });

  it("finds a robots.txt file and sitemap", async () => {
    // Note: the robots.txt file uses an `http:` URL for the sitemap even though
    // the (fake) site is defined as `https:`. This tests a situation we've hit
    // in practice, where a site's robots.txt file is out of date. We test that
    // the crawler ignores the protocol when deciding whether to crawl a path.
    const graph = {
      "foo.html": "Foo",
      "sitemap.xml": `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/foo.html</loc>
  </url>
</urlset>`,
      "robots.txt": "Sitemap: http://example.com/sitemap.xml",
    };
    const crawled = await crawl.call(null, graph, "https://example.com");
    assert.deepEqual(await ExplorableGraph.keys(crawled), [
      "robots.txt",
      "sitemap.xml",
      "foo.html",
    ]);
  });
});
