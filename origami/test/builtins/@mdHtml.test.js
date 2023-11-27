import { Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import mdHtml from "../../src/builtins/@mdHtml.js";
import * as textDocument2 from "../../src/common/textDocument2.js";

describe("mdHtml", () => {
  test("transforms markdown to HTML", async () => {
    const markdown = `# Hello, world.`;
    const htmlDocument = await mdHtml(markdown);
    assert.equal(
      String(htmlDocument),
      `<h1 id="hello-world">Hello, world.</h1>\n`
    );
  });

  test("transformed result includes the source data", async () => {
    const markdownDocument = textDocument2.unpack(
      `---\ntitle: Hello\n---\n# Hello, world.`
    );
    const htmlDocument = await mdHtml.call(null, markdownDocument);
    assert.equal(
      String(htmlDocument),
      `<h1 id="hello-world">Hello, world.</h1>\n`
    );
    assert.deepEqual(await Tree.plain(htmlDocument), {
      "@body": `<h1 id="hello-world">Hello, world.</h1>\n`,
      title: "Hello",
    });
  });
});
