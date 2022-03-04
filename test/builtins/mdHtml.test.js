import mdHtml from "../../src/builtins/mdHtml.js";
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
});
