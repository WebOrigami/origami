import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import ExplorableSiteTransform from "../../src/common/ExplorableSiteTransform.js";
describe("ExplorableSiteTransform", () => {
  test.skip("treats an undefined key at the end of a traversal as index.html", async () => {
    const graph = new (ExplorableSiteTransform(ObjectGraph))({
      foo: {
        bar: {
          "index.html": "Index",
        },
      },
    });
    const value = await GraphHelpers.traverse(graph, ["foo", "bar", undefined]);
    assert.equal(value, "Index");
  });
});
