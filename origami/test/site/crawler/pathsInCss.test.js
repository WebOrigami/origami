import assert from "node:assert";
import { describe, test } from "node:test";
import pathsInCss from "../../../src/site/crawler/pathsInCss.js";

describe("pathsInCss", () => {
  test("finds paths in CSS", async () => {
    const css = `
      /* url("bogus.css") ignored because it's in a comment */
      
      @import "stringImport.css" screen and (min-width: 600px);
      @import url("import.css");

      @font-face {
        font-family: "OpenSans";
        src:
          local("Open Sans"),
          url("/fonts/OpenSans.woff2") format("woff2"),
          url("/fonts/OpenSans.woff")  format("woff");
      }
      
      body {
        background-image: url("background.jpg");
      }
    `;
    const paths = await pathsInCss(css);
    assert.deepEqual(paths, {
      crawlablePaths: ["stringImport.css", "import.css"],
      resourcePaths: ["/fonts/OpenSans.woff2", "background.jpg"],
    });
  });
});
