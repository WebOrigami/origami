import { DeepObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import sitemap from "../../src/builtins/@sitemap.js";

describe("@sitemap", () => {
  test("returns a sitemap for a tree", async () => {
    const tree = new DeepObjectTree({
      "a.html": "A",
      b: {
        "index.html": "Index",
        "c.html": "C",
      },
    });
    const result = await sitemap.call(null, tree, "https://example.com");
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
