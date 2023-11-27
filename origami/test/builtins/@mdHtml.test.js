import assert from "node:assert";
import { describe, test } from "node:test";
import unpackText from "../../src/builtins/@loaders/txt.js";
import mdHtml from "../../src/builtins/@mdHtml.js";

describe("mdHtml", () => {
  test("transforms markdown to HTML", async () => {
    const markdown = `# Hello, world.`;
    const htmlDocument = mdHtml(markdown);
    assert.equal(
      String(htmlDocument),
      `<h1 id="hello-world">Hello, world.</h1>\n`
    );
  });

  test("transformed result includes the source data", async () => {
    const markdownDocument = await unpackText(
      `---\ntitle: Hello\n---\n# Hello, world.`
    );
    const htmlDocument = mdHtml.call(null, markdownDocument);
    assert.equal(
      String(htmlDocument),
      `<h1 id="hello-world">Hello, world.</h1>\n`
    );
    assert.deepEqual(htmlDocument, {
      "@text": `<h1 id="hello-world">Hello, world.</h1>\n`,
      title: "Hello",
    });
  });
});
