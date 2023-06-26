import { GraphHelpers } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadJson from "../../src/loaders/json.js";

describe(".json loader", () => {
  test("loads input as a JSON file", async () => {
    const text = `{ "a": 1, "b": 2 }`;
    const textWithGraph = await loadJson.call(null, text);
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
    const result = await loadJson.call(null, input);
    assert.equal(result, input);
  });
});
