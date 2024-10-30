import assert from "node:assert";
import { describe, test } from "node:test";
import fileTypeYaml from "../../../src/builtins/yaml.handler.js";

describe(".yaml handler", () => {
  test("loads input as a YAML file", async () => {
    const text = `
a: 1
b: 2
`;
    const data = fileTypeYaml.unpack(text);
    assert.deepEqual(data, {
      a: 1,
      b: 2,
    });
  });
});
