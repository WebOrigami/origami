import { GraphHelpers } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadGraph from "../../src/loaders/graph.js";

describe(".graph loader", () => {
  test("loads a file as an Origami graph", async () => {
    const text = `
      name = 'world'
      message = \`Hello, {{ name }}!\`
    `;
    const textWithGraph = await loadGraph.call(null, text);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await GraphHelpers.plain(graph), {
      name: "world",
      message: "Hello, world!",
    });
  });
});
