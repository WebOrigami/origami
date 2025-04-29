import assert from "node:assert";
import { describe, test } from "node:test";
import pathsInCss from "../../../src/dev/crawler/pathsInCss.js";

describe("pathsInCss", () => {
  test("finds URLs in CSS", async () => {
    const css = `
      /* url("bogus.css") ignored because it's in a comment */
      
      @namespace url(http://www.w3.org/1999/xhtml);

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
      resourcePaths: [
        "http://www.w3.org/1999/xhtml",
        "/fonts/OpenSans.woff2",
        "/fonts/OpenSans.woff",
        "background.jpg",
      ],
    });
  });

  test("handles string and url() calls in image() and image-set()", async () => {
    const css = `
      body {
        background-image: image("background.jpg");
        background-image: image-set("image-set.jpg" 1x, url("image-set.png") 2x);
      }
    `;
    const paths = await pathsInCss(css);
    assert.deepEqual(paths, {
      crawlablePaths: [],
      resourcePaths: ["background.jpg", "image-set.jpg", "image-set.png"],
    });
  });
});
