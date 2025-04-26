import assert from "node:assert";
import { describe, test } from "node:test";
import pathsInCss from "../../../src/site/crawler/pathsInCss.js";

describe("pathsInCss", () => {
  test("finds paths in HTML", async () => {
    const css = `
      @import url("styles.css");

      body {
        background-image: url("background.jpg");
      }
    `;
    const paths = await pathsInCss(css);
    assert.deepEqual(paths, {
      crawlablePaths: ["styles.css"],
      resourcePaths: ["background.jpg"],
    });
  });
});
