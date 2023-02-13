import loadTextWithFrontMatter from "../../src/common/loadTextWithFrontMatter.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("loadTextWithFrontMatter", () => {
  it("returns plain text input as is", async () => {
    const result = await loadTextWithFrontMatter("text");
    assert.equal(result, "text");
  });

  it("attaches YAML/JSON front matter as a graph", async () => {
    const result = await loadTextWithFrontMatter(`---
foo: 1
---
text`);
    assert.equal(String(result), "text");
    const graph = /** @type {any} */ (result).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), { foo: 1 });
  });
});
