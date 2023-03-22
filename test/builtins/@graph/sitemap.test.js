import sitemap from "../../../src/builtins/@graph/sitemap.js";
import assert from "../../assert.js";

describe("@graph/sitemap", () => {
  it("returns a sitemap for a graph", async () => {
    const graph = {
      "a.html": "A",
      b: {
        "index.html": "Index",
        "c.html": "C",
      },
    };
    const result = await sitemap.call(null, graph, "https://example.com");
    assert.deepEqual(
      result,
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/a.html</loc>
  </url>
  <url>
    <loc>https://example.com/b/</loc>
  </url>
  <url>
    <loc>https://example.com/b/c.html</loc>
  </url>
</urlset>
`
    );
  });
});
