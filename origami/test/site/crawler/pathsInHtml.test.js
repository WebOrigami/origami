import assert from "node:assert";
import { describe, test } from "node:test";
import pathsInHtml from "../../../src/site/crawler/pathsInHtml.js";

describe("pathsInHtml", () => {
  test("finds paths in HTML", async () => {
    const html = `
      <a href="about/index.html">About</a>
      <img src="logo.png">
      <script src="script.js"></script>
      <link rel="stylesheet" href="style.css">
    `;
    const paths = await pathsInHtml(html);
    assert.deepEqual(paths, {
      crawlablePaths: ["about/index.html", "style.css", "script.js"],
      resourcePaths: ["logo.png"],
    });
  });
});
