import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import loadMeta from "../../src/loaders/meta.js";
import assert from "../assert.js";

describe(".meta loader", () => {
  it("loads input as a YAML/JSON metagraph", async () => {
    const text = `
a: Hello
b = a:
`;
    const textWithGraph = await loadMeta.call(null, text);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: "Hello",
      b: "Hello",
    });
  });
});
