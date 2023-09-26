import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import TextWithContents from "../../src/common/TextWithContents.js";
import loadTextWithFrontMatter from "../../src/common/loadTextWithFrontMatter.js";
describe("loadTextWithFrontMatter", () => {
  test("returns plain text input as is", () => {
    const result = loadTextWithFrontMatter.call(null, "text");
    assert.equal(result, "text");
  });

  test("attaches YAML/JSON front matter as contents", async () => {
    const text = `---
a: 1
---
text`;
    const textFile = await loadTextWithFrontMatter.call(null, text);
    assert.equal(String(textFile), "text");
    const graph = /** @type {any} */ (textFile).contents();
    assert.deepEqual(await Graph.plain(graph), { a: 1 });
    assert.deepEqual(await graph.get(Graph.defaultValueKey), "text");
  });

  test("passes along input if it already has contents", async () => {
    /** @type {any} */
    const input = new TextWithContents("text", { a: 1 });
    const textFile = await loadTextWithFrontMatter.call(null, input);
    assert.equal(textFile, input);
  });
});
