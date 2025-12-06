import assert from "node:assert";
import { describe, test } from "node:test";
import yaml_handler from "../../src/handlers/yaml_handler.js";

describe(".yaml handler", () => {
  test("loads input as a YAML file", async () => {
    const text = `
a: 1
b: 2
`;
    const data = await yaml_handler.unpack(text);
    assert.deepEqual(data, {
      a: 1,
      b: 2,
    });
  });

  test("defines !ori tag for Origami expressions", async () => {
    const text = `
message: Hello
answer: !ori 1 + 1
`;
    const data = await yaml_handler.unpack(text);
    assert.deepEqual(data, {
      message: "Hello",
      answer: 2,
    });
  });

  test("defines !ori.call tag for Origami function invocation", async () => {
    const text = `
message: Hello
answer: !ori.call
  - (a, b) => a + b
  - 2
  - 3
`;
    const data = await yaml_handler.unpack(text);
    assert.deepEqual(data, {
      message: "Hello",
      answer: 5,
    });
  });
});
