import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadYaml from "../../src/loaders/yaml.js";

describe(".yaml loader", () => {
  test("loads input as a YAML file", async () => {
    const text = `
a: 1
b: 2
`;
    const textWithGraph = await loadYaml(null, text);
    const graph = await /** @type {any} */ (textWithGraph).contents();
    assert.deepEqual(await Graph.plain(graph), {
      a: 1,
      b: 2,
    });
  });

  test("can parse tagged Origami expressions", async () => {
    const text = `
a: 1
b: !ori a
`;
    const textWithGraph = await loadYaml(null, text);
    const graph = await /** @type {any} */ (textWithGraph).contents();
    assert.deepEqual(await Graph.plain(graph), {
      a: 1,
      b: 1,
    });
  });
});
