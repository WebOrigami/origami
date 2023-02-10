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

  it("if input is already a plain object, treats that as the parsed YAML", async () => {
    const input = {
      a: 1,
      b: 2,
    };
    const textWithGraph = await loadYaml.call(null, input);
    assert.equal(String(textWithGraph), "a: 1\nb: 2\n");
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
    });
  });

  it("can parse tagged Origami expressions", async () => {
    const text = `
a: 1
b: != a
`;
    const textWithGraph = await loadYaml.call(null, text);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 1,
    });
  });
});
