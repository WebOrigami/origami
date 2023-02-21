import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import loadMarkdown from "../../src/loaders/md.js";
import assert from "../assert.js";

describe(".md loader", () => {
  it("loads markdown without front matter as text", async () => {
    const text = `# Title`;
    const loaded = await loadMarkdown.call(null, text);
    assert.equal(loaded, text);
  });

  it("loads markdown with front matter as an expression graph", async () => {
    const text = `---
a: !ori 1
---
# Title`;
    const loaded = await loadMarkdown.call(null, text);
    assert.equal(String(loaded), `# Title`);
    const graph = /** @type {any} */ (loaded).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
    });
  });
});
