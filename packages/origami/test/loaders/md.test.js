import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadMarkdown from "../../src/loaders/md.js";

describe(".md loader", () => {
  test("loads markdown without front matter as text", async () => {
    const text = `# Title`;
    const loaded = await loadMarkdown.call(null, text);
    assert.equal(loaded, text);
  });

  test("loads markdown with front matter as an expression graph", async () => {
    const text = `---
a: !ori 1
---
# Title`;
    const markdownFile = await loadMarkdown.call(null, text);
    assert.equal(markdownFile.bodyText, `# Title`);
    const graph = await /** @type {any} */ (markdownFile).contents();
    assert.deepEqual(await Graph.plain(graph), {
      a: 1,
    });
  });
});
