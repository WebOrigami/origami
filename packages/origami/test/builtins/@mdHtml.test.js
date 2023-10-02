import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import mdHtml from "../../src/builtins/@mdHtml.js";
import FrontMatterDocument from "../../src/common/FrontMatterDocument.js";

describe("mdHtml", () => {
  test("transforms markdown to HTML", async () => {
    const markdown = `# Hello, world.`;
    const htmlDocument = await mdHtml(markdown);
    assert.equal(
      htmlDocument.bodyText,
      `<h1 id="hello-world">Hello, world.</h1>\n`
    );
  });

  test("HTML contents include the source contents and the HTML", async () => {
    const markdownDocument = new FrontMatterDocument(
      `---\ntitle: Hello\n---\n# Hello, world.`
    );
    const htmlDocument = await mdHtml.call(null, markdownDocument);
    const html = htmlDocument.bodyText;
    assert.equal(html, `<h1 id="hello-world">Hello, world.</h1>\n`);
    const graph = await htmlDocument.contents();
    assert.deepEqual(await Graph.plain(graph), {
      title: "Hello",
    });
  });
});
