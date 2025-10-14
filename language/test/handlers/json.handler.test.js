import assert from "node:assert";
import { describe, test } from "node:test";
import json_handler from "../../src/handlers/json_handler.js";

describe(".json handler", () => {
  test("loads input as a JSON file", async () => {
    const text = `{ "a": 1, "b": 2 }`;
    const obj = await json_handler.unpack(text);
    assert.deepEqual(obj, {
      a: 1,
      b: 2,
    });
  });
});
