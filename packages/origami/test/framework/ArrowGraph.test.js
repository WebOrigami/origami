import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import ArrowGraph from "../../src/framework/ArrowGraph.js";
import FileTreeTransform from "../../src/framework/FileTreeTransform.js";

describe.only("ArrowGraph", () => {
  test.only("interprets ← in a key as a function call", async () => {
    const graph = new (FileTreeTransform(ObjectGraph))({
      "index.html ← .ori": "<h1>{{ title }}</h1>",
      title: "Our Site",
    });
    const arrows = new ArrowGraph(graph);
    assert.deepEqual(await GraphHelpers.plain(arrows), {
      "index.html": "<h1>Our Site</h1>",
      title: "Our Site",
    });
  });
});
