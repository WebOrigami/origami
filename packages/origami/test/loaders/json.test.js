import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadJson from "../../src/loaders/json.js";

describe(".json loader", () => {
  test("loads input as a JSON file", async () => {
    const text = `{ "a": 1, "b": 2 }`;
    const jsonFile = await loadJson(null, text);
    const contents = await jsonFile.contents();
    assert.deepEqual(await Graph.plain(contents), {
      a: 1,
      b: 2,
    });
  });
});
