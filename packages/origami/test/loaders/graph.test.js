import assert from "node:assert";
import { describe, test } from "node:test";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import loadGraph from "../../src/loaders/graph.js";

describe(".graph loader", () => {
  test("loads a file as an Origami graph", async () => {
    const text = `
      name = 'world'
      message = \`Hello, {{ name }}!\`
    `;
    const textWithGraph = await loadGraph.call(null, text);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      name: "world",
      message: "Hello, world!",
    });
  });
});
