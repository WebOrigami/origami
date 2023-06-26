import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import StringWithGraph from "../../src/common/StringWithGraph.js";
import loadTextWithFrontMatter from "../../src/common/loadTextWithFrontMatter.js";
describe("loadTextWithFrontMatter", () => {
  test("returns plain text input as is", () => {
    const result = loadTextWithFrontMatter.call(null, "text");
    assert.equal(result, "text");
  });

  test("attaches YAML/JSON front matter as a graph", async () => {
    const text = `---
a: 1
---
text`;
    const result = await loadTextWithFrontMatter.call(null, text);
    assert.equal(String(result), text);
    const graph = /** @type {any} */ (result).toGraph();
    assert.deepEqual(await GraphHelpers.plain(graph), { a: 1 });
  });

  test("passes along an attached graph if no front matter", async () => {
    const input = new StringWithGraph("text", new ObjectGraph({ a: 1 }));
    const result = await loadTextWithFrontMatter.call(null, input);
    assert.equal(String(result), "text");
    const graph = /** @type {any} */ (result).toGraph();
    assert.deepEqual(await GraphHelpers.plain(graph), { a: 1 });
  });
});
