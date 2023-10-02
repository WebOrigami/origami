import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import mdHtml from "../../src/builtins/@mdHtml.js";
import TextFile from "../../src/common/TextFile.js";

describe.only("mdHtml", () => {
  test("transforms markdown to HTML", async () => {
    const markdown = `# Hello, world.`;
    const html = await mdHtml(markdown);
    assert.equal(html, `<h1 id="hello-world">Hello, world.</h1>\n`);
  });

  test.only("HTML contents include the source contents and the HTML", async () => {
    const markdownFile = new TextFile(
      `---\ntitle: Hello\n---\n# Hello, world.`
    );
    const htmlFile = await mdHtml.call(null, markdownFile);
    const html = String(htmlFile);
    assert.equal(html, `<h1 id="hello-world">Hello, world.</h1>\n`);
    const graph = await htmlFile.contents();
    assert.deepEqual(await Graph.plain(graph), {
      title: "Hello",
    });
  });
});
