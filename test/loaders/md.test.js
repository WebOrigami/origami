import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import loadMeta from "../../src/loaders/meta.js";
import assert from "../assert.js";

describe(".md loader", () => {
  it("loads markdown without front matter as text", async () => {
    const text = `# Title`;
    const loaded = await loadMeta.call(null, text);
    assert.equal(loaded, text);
  });

  it("loads markdown with front matter as a metagraph", async () => {
    const text = `---
a = 1:
---
# Title`;
    const loaded = await loadMeta.call(null, text);
    assert.equal(loaded, text);
    const graph = /** @type {any} */ (loaded).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      "@text": "# Title",
    });
  });
});
