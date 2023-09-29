import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadTextWithFrontMatter from "../../src/common/loadTextWithFrontMatter.js";
describe("loadTextWithFrontMatter", () => {
  test("returns plain text input as is", () => {
    const result = loadTextWithFrontMatter(null, "text");
    assert.equal(result, "text");
  });

  test("attaches YAML/JSON front matter as contents", async () => {
    const text = `---
a: 1
---
text`;
    const textFile = await loadTextWithFrontMatter(null, text);
    assert.equal(String(textFile), text);
    const graph = await textFile.contents();
    assert.deepEqual(await Graph.plain(graph), { a: 1 });
    assert.deepEqual(await graph.get(Graph.defaultValueKey), "text");
  });
});
