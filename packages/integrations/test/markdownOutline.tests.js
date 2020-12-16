import chai from "chai";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import markdownOutline from "../src/markdownOutline.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(dirname, "fixtures");

describe.only("markdownOutline", () => {
  it("parses Markdown content into a structured outline", async () => {
    const markdownFile = path.join(fixtures, "sample.md");
    const markdown = String(await fs.readFile(markdownFile, "utf-8"));
    const outline = markdownOutline(markdown);
    const expectedFile = path.join(fixtures, "sample.json");
    const expected = JSON.parse(
      String(await fs.readFile(expectedFile, "utf-8"))
    );
    assert.deepEqual(outline, expected);
  });
});
