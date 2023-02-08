import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import loadYaml from "../../src/loaders/yaml.js";
import assert from "../assert.js";

describe(".yaml loader", () => {
  it("loads input as a YAML file", async () => {
    const text = `
a: 1
b: 2
`;
    const textWithGraph = await loadYaml.call(null, text);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
    });
  });
});