import { OrigamiTree, Scope } from "@graphorigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import builtins from "../../src/builtins/@builtins.js";
import ArrowTree from "../../src/common/ArrowTree.js";

describe("ArrowTree", () => {
  test("interprets ← in a key as a function call", async () => {
    const tree = Scope.treeWithScope(
      new OrigamiTree({
        "index.html ← .orit": "<h1>{{ title }}</h1>",
        title: "Our Site",
      }),
      builtins
    );
    const arrows = new ArrowTree(tree);
    assert.deepEqual([...(await arrows.keys())], ["index.html", "title"]);
    const indexHtml = await arrows.get("index.html");
    assert.equal(String(indexHtml), "<h1>Our Site</h1>");
  });
});
