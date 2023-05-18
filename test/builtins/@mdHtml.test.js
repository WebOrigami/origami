import mdHtml from "../../src/builtins/@mdHtml.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import md from "../../src/loaders/md.js";
import assert from "../assert.js";

describe("mdHtml", () => {
  it("transforms markdown to HTML", async () => {
    const markdown = `# Hello, world.`;
    const html = await mdHtml(markdown);
    assert.equal(html, `<h1 id="hello-world">Hello, world.</h1>\n`);
  });

  it("outputs frontmatter", async () => {
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

  it("output includes a graph representation", async () => {
    const markdown = `---
title: Hello
---
# Hello, world.`;
    const html = await mdHtml(md.call(null, markdown));
    const graph = /** @type {any} */ (html).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      title: "Hello",
    });
  });
});
