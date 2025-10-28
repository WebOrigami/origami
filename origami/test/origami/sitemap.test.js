import { DeepObjectMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { before, describe, test } from "node:test";
import initializeBuiltins from "../../src/initializeBuiltins.js";
import sitemap from "../../src/origami/sitemap.js";

describe("sitemap", () => {
  before(() => {
    initializeBuiltins();
  });

  test("returns a sitemap for a tree", async () => {
    const tree = new DeepObjectMap({
      "a.html": "A",
      b: {
        "index.html": "Index",
        "c.html": "C",
      },
    });
    const result = await sitemap(tree, {
      base: "https://example.com",
    });
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
