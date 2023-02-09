import mdHtml from "../../src/builtins/mdHtml.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("mdHtml", () => {
  it("transforms markdown to HTML", async () => {
    const markdown = `# Hello, world.`;
    const html = await mdHtml(markdown);
    assert.equal(html, `<h1 id="hello-world">Hello, world.</h1>\n`);
  });

  it("preserves frontmatter", async () => {
    const markdown = `---
title: Hello
---
# Hello, world.`;
    const html = await mdHtml(markdown);
    assert.equal(
      html,
      `---
title: Hello
---
<h1 id="hello-world">Hello, world.</h1>
`
    );
  });

  it.only("output includes a graph representation", async () => {
    const markdown = `---
title: Hello
---
# Hello, world.`;
    const html = await mdHtml(markdown);
    const graph = html.toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      title: "Hello",
      "@text": `<h1 id="hello-world">Hello, world.</h1>\n`,
    });
  });
});
