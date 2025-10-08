import assert from "node:assert";
import { describe, test } from "node:test";
import yamlHandler from "../../src/handlers/yaml.handler.js";

describe(".yaml handler", () => {
  test("loads input as a YAML file", async () => {
    const text = `
a: 1
b: 2
`;
    const data = yamlHandler.unpack(text);
    assert.deepEqual(data, {
      a: 1,
      b: 2,
    });
  });
});
