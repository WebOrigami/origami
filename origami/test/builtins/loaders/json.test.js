import assert from "node:assert";
import { describe, test } from "node:test";
import unpackJson from "../../../src/builtins/@loaders/json.js";

describe(".json loader", () => {
  test("loads input as a JSON file", async () => {
    const text = `{ "a": 1, "b": 2 }`;
    const obj = await unpackJson(text);
    assert.deepEqual(obj, {
      a: 1,
      b: 2,
    });
  });
});
