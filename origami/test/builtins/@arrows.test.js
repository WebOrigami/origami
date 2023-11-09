import { OrigamiTree, Scope } from "@graphorigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import arrows from "../../src/builtins/@arrows.js";
import builtins from "../../src/builtins/@builtins.js";

describe("arrowMap", () => {
  test("interprets ← in a key as a function call", async () => {
    const treelike = new OrigamiTree({
      "index.html ← .orit": "<h1>{{ title }}</h1>",
      title: "Our Site",
    });
    const tree = Scope.treeWithScope(treelike, builtins);
    const fixture = await arrows.call(null, tree);
    assert.deepEqual([...(await fixture.keys())], ["index.html", "title"]);
    const indexHtml = await fixture.get("index.html");
    assert.equal(String(indexHtml), "<h1>Our Site</h1>");
  });
});
