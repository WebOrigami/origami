import Zip from "adm-zip";
import assert from "node:assert";
import { describe, test } from "node:test";
import epub_handler from "../../src/handlers/epub_handler.js";

describe("EPUB handler", () => {
  test("ensures mimetype file comes first", async () => {
    const tree = {
      EPUB: {
        "index.xhtml": "This is where the book content goes",
      },
      "META-INF": {
        "container.xml": "This is where the metadata goes",
      },
      mimetype: "application/epub+zip",
    };
    const buffer = await epub_handler.pack(tree);
    const unzipped = new Zip(buffer);
    const entries = unzipped.getEntries();
    const entryNames = entries.map((entry) => entry.entryName);
    assert.deepEqual(entryNames, [
      "mimetype",
      "EPUB/index.xhtml",
      "META-INF/container.xml",
    ]);
  });
});
