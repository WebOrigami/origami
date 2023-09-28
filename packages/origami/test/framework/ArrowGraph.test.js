import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import ArrowGraph from "../../src/framework/ArrowGraph.js";
import FileTreeTransform from "../../src/framework/FileTreeTransform.js";

describe("ArrowGraph", () => {
  test("interprets ← in a key as a function call", async () => {
    const graph = new (FileTreeTransform(ObjectGraph))({
      "index.html ← .orit": "<h1>{{ title }}</h1>",
      title: "Our Site",
    });
    const arrows = new ArrowGraph(graph);
    assert.deepEqual([...(await arrows.keys())], ["index.html", "title"]);
    const indexHtml = await arrows.get("index.html");
    assert.equal(String(indexHtml), "<h1>Our Site</h1>");
  });
});
