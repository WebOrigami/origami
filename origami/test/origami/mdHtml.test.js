import { ObjectTree, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import mdHtml from "../../src/origami/mdHtml.js";

describe("mdHtml", () => {
  test("transforms markdown text to HTML text", async () => {
    const markdown = `# Hello, world.`;
    const htmlDocument = await mdHtml(markdown);
    assert.equal(htmlDocument, `<h1 id="hello-world">Hello, world.</h1>\n`);
  });

  test("transformed markdown document to HTML document", async () => {
    const markdownDocument = {
      _body: `# Hello, world.`,
      title: "Hello",
    };
    /** @type {any} */
    const htmlDocument = await mdHtml.call(null, markdownDocument);
    assert.deepEqual(htmlDocument, {
      _body: `<h1 id="hello-world">Hello, world.</h1>\n`,
      title: "Hello",
    });
  });

  test("mapping with @mdHtml changes keys by default", async () => {
    const markdownFiles = new ObjectTree({
      "Alice.md": "Hello, **Alice**!",
      "Bob.md": "Hello, **Bob**!",
    });
    const htmlFiles = await Tree.map(markdownFiles, mdHtml);
    assert.deepEqual(await Tree.plain(htmlFiles), {
      "Alice.html": "<p>Hello, <strong>Alice</strong>!</p>\n",
      "Bob.html": "<p>Hello, <strong>Bob</strong>!</p>\n",
    });
  });
});
