import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import unpackYaml from "../../src/loaders/yaml.js";

describe(".yaml loader", () => {
  test("loads input as a YAML file", async () => {
    const text = `
a: 1
b: 2
`;
    const data = await unpackYaml(text);
    assert.deepEqual(await Graph.plain(data), {
      a: 1,
      b: 2,
    });
  });

  test("can parse tagged Origami expressions", async () => {
    const text = `
a: 1
b: !ori a
`;
    const graph = await unpackYaml(text);
    assert.deepEqual(await Graph.plain(graph), {
      a: 1,
      b: 1,
    });
  });
});
