import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import mdHtml from "../../src/builtins/@mdHtml.js";
import md from "../../src/loaders/md.js";

describe("mdHtml", () => {
  test("transforms markdown to HTML", async () => {
    const markdown = `# Hello, world.`;
    const html = await mdHtml(markdown);
    assert.equal(html, `<h1 id="hello-world">Hello, world.</h1>\n`);
  });

  test("outputs frontmatter", async () => {
    const text = `---
title: Hello
---
# Hello, world.`;
    const markdown = md.call(null, text);
    const html = await mdHtml(markdown, true);
    assert.equal(
      String(html),
      `---
title: Hello
---
<h1 id="hello-world">Hello, world.</h1>
`
    );
  });

  test("output includes a graph representation", async () => {
    const markdown = `---
title: Hello
---
# Hello, world.`;
    const html = await mdHtml(md.call(null, markdown));
    const graph = /** @type {any} */ (html).toGraph();
    assert.deepEqual(await Graph.plain(graph), {
      title: "Hello",
    });
  });
});
