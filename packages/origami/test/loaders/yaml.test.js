import { GraphHelpers } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadYaml from "../../src/loaders/yaml.js";

describe(".yaml loader", () => {
  test("loads input as a YAML file", async () => {
    const text = `
a: 1
b: 2
`;
    const textWithGraph = await loadYaml.call(null, text);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await GraphHelpers.plain(graph), {
      a: 1,
      b: 2,
    });
  });

  test("input that is already a graph variant is returned as is", async () => {
    const input = {
      a: 1,
      b: 2,
    };
    const result = await loadYaml.call(null, input);
    assert.deepEqual(result, input);
  });

  test("can parse tagged Origami expressions", async () => {
    const text = `
a: 1
b: !ori a
`;
    const textWithGraph = await loadYaml.call(null, text);
    const graph = /** @type {any} */ (textWithGraph).toGraph();
    assert.deepEqual(await GraphHelpers.plain(graph), {
      a: 1,
      b: 1,
    });
  });

  test("invoking loaded YAML as function with string argument gets value", async () => {
    const text = `
a: 1
`;
    const textWithGraph = await loadYaml.call(null, text);
    const fn = textWithGraph.toFunction();
    assert.equal(await fn("a"), 1);
  });

  test("invoking loaded YAML as function with object argument puts argument in scope", async () => {
    const text = `
  foo: !ori (@input/bar)
  `;
    const textWithGraph = await loadYaml.call(null, text);
    const fn = textWithGraph.toFunction();
    const graph = await fn({ bar: 1 });
    assert.equal(await graph.get("foo"), 1);
  });
});
