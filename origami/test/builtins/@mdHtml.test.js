import assert from "node:assert";
import { describe, test } from "node:test";
import mdHtml from "../../src/builtins/@mdHtml.js";

describe("mdHtml", () => {
  test("transforms markdown text to HTML text", async () => {
    const markdown = `# Hello, world.`;
    const htmlDocument = await mdHtml(markdown);
    assert.equal(
      String(htmlDocument),
      `<h1 id="hello-world">Hello, world.</h1>\n`
    );
  });

  test("transformed markdown document to HTML document", async () => {
    const markdownDocument = {
      "@text": `# Hello, world.`,
      title: "Hello",
    };
    const htmlDocument = await mdHtml.call(null, markdownDocument);
    assert.deepEqual(htmlDocument, {
      "@text": `<h1 id="hello-world">Hello, world.</h1>\n`,
      title: "Hello",
    });
  });
});
