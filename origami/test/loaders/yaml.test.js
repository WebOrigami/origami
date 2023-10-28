import { Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import unpackYaml from "../../src/builtins/@loaders/yaml.js";

describe(".yaml loader", () => {
  test("loads input as a YAML file", async () => {
    const text = `
a: 1
b: 2
`;
    const data = await unpackYaml(text);
    assert.deepEqual(await Tree.plain(data), {
      a: 1,
      b: 2,
    });
  });

  test("can parse tagged Origami expressions", async () => {
    const text = `
a: 1
b: !ori a
`;
    const tree = await unpackYaml(text);
    assert.deepEqual(await Tree.plain(tree), {
      a: 1,
      b: 1,
    });
  });
});
