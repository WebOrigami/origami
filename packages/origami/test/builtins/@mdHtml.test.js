import assert from "node:assert";
import { describe, test } from "node:test";
import mdHtml from "../../src/builtins/@mdHtml.js";
import TextDocument2 from "../../src/common/TextDocument2.js";

describe("mdHtml", () => {
  test("transforms markdown to HTML", async () => {
    const markdown = `# Hello, world.`;
    const htmlDocument = await mdHtml(markdown);
    assert.equal(
      htmlDocument.text,
      `<h1 id="hello-world">Hello, world.</h1>\n`
    );
  });

  test("HTML contents include the source contents and the HTML", async () => {
    const markdownDocument = TextDocument2.deserialize(
      `---\ntitle: Hello\n---\n# Hello, world.`
    );
    const htmlDocument = await mdHtml.call(null, markdownDocument);
    assert.equal(
      htmlDocument.text,
      `<h1 id="hello-world">Hello, world.</h1>\n`
    );
    assert.deepEqual(htmlDocument.data, {
      title: "Hello",
    });
  });
});
