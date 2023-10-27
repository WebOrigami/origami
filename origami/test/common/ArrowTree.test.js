import { ObjectTree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import ArrowTree from "../../src/common/ArrowTree.js";
import OrigamiTransform from "../../src/runtime/OrigamiTransform.js";

describe("ArrowTree", () => {
  test("interprets ← in a key as a function call", async () => {
    const tree = new (OrigamiTransform(ObjectTree))({
      "index.html ← .orit": "<h1>{{ title }}</h1>",
      title: "Our Site",
    });
    const arrows = new ArrowTree(tree);
    assert.deepEqual([...(await arrows.keys())], ["index.html", "title"]);
    const indexHtml = await arrows.get("index.html");
    assert.equal(String(indexHtml), "<h1>Our Site</h1>");
  });
});
