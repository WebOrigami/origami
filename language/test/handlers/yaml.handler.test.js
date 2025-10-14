import assert from "node:assert";
import { describe, test } from "node:test";
import yaml_handler from "../../src/handlers/yaml_handler.js";

describe(".yaml handler", () => {
  test("loads input as a YAML file", async () => {
    const text = `
a: 1
b: 2
`;
    const data = yaml_handler.unpack(text);
    assert.deepEqual(data, {
      a: 1,
      b: 2,
    });
  });
});
