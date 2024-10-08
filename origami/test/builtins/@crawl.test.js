import { DeepObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import crawl from "../../src/builtins/@crawl.js";

// Test version of DeepObjectTree that doesn't return keys so we can confirm
// that the crawler is able to find linked resources without them.
class DeepObjectTreeWithoutKeys extends DeepObjectTree {
  async keys() {
    return new Set();
  }
}

describe("crawl", () => {
  test("finds linked pages", async () => {
    const tree = {
      "index.html": `
        <a href="about/index.html">About</a>
        <a href="https://example.com">External</a>
      `,
      about: {
        "index.html": `About Us <a href="team.html">Team</a>`,
        "team.html": "Our Team",
      },
    };
    const treeWithoutKeys = new DeepObjectTreeWithoutKeys(tree);
    const crawled = await crawl.call(null, treeWithoutKeys);
    // Crawl should recover entire tree
    const plain = await Tree.plain(crawled);
    assert.deepEqual(plain, tree);
  });

  test("finds linked images", async () => {
    const tree = {
      "index.html": `<img src="logo.png">`,
      "logo.png": "PNG data",
    };
    const crawled = await crawl.call(null, tree);
    assert.deepEqual(Array.from(await crawled.keys()), [
      "index.html",
      "logo.png",
    ]);
  });

  test("finds linked JavaScript files", async () => {
    const tree = {
      "index.html": `
        <script src="a.js" type="module"></script>
      `,
      "a.js": "import b from './b.js';",
      "b.js": "export default true;",
    };
    const crawled = await crawl.call(null, tree);
    assert.deepEqual(Array.from(await crawled.keys()), [
      "index.html",
      "a.js",
      "b.js",
    ]);
  });

  test("finds a robots.txt file and sitemap", async () => {
    // Note: the robots.txt file uses an `http:` URL for the sitemap even though
    // the (fake) site is defined as `https:`. This tests a situation we've hit
    // in practice, where a site's robots.txt file is out of date. We test that
    // the crawler ignores the protocol when deciding whether to crawl a path.
    const tree = {
      "index.html": "Foo",
      "sitemap.xml": `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/index.html</loc>
  </url>
</urlset>`,
      "robots.txt": "Sitemap: http://example.com/sitemap.xml",
    };
    const crawled = await crawl.call(null, tree, "https://example.com");
    assert.deepEqual(Array.from(await crawled.keys()), [
      "robots.txt",
      "index.html",
      "sitemap.xml",
    ]);
  });

  test("can report missing crawlable resources like pages", async () => {
    const tree = {
      "index.html": `<a href="missing.html">Missing</a>`,
    };
    const crawled = await crawl.call(null, tree);
    const json = await crawled.get("crawl-errors.json");
    const parsed = JSON.parse(json);
    assert.deepEqual(parsed, {
      "index.html": ["missing.html"],
    });
  });
});
