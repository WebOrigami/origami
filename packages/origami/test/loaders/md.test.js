import { GraphHelpers } from "@graphorigami/core";
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
    const loaded = await loadMarkdown.call(null, text);
    assert.equal(loaded.bodyText, `# Title`);
    const graph = /** @type {any} */ (loaded).toGraph();
    assert.deepEqual(await GraphHelpers.plain(graph), {
      a: 1,
    });
  });
});
