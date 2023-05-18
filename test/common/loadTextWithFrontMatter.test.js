import loadTextWithFrontMatter from "../../src/common/loadTextWithFrontMatter.js";
import StringWithGraph from "../../src/common/StringWithGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("loadTextWithFrontMatter", () => {
  it("returns plain text input as is", () => {
    const result = loadTextWithFrontMatter.call(null, "text");
    assert.equal(result, "text");
  });

  it("attaches YAML/JSON front matter as a graph", async () => {
    const text = `---
a: 1
---
text`;
    const result = await loadTextWithFrontMatter.call(null, text);
    assert.equal(String(result), text);
    const graph = /** @type {any} */ (result).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), { a: 1 });
  });

  it("passes along an attached graph if no front matter", async () => {
    const input = new StringWithGraph("text", new ObjectGraph({ a: 1 }));
    const result = await loadTextWithFrontMatter.call(null, input);
    assert.equal(String(result), "text");
    const graph = /** @type {any} */ (result).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), { a: 1 });
  });
});
