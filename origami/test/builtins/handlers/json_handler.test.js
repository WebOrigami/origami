import assert from "node:assert";
import { describe, test } from "node:test";
import fileTypeJson from "../../../src/builtins/json_handler.js";

describe(".json handler", () => {
  test("loads input as a JSON file", async () => {
    const text = `{ "a": 1, "b": 2 }`;
    const obj = await fileTypeJson.unpack(text);
    assert.deepEqual(obj, {
      a: 1,
      b: 2,
    });
  });
});
