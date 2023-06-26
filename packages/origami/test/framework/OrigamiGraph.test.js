import { GraphHelpers } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import * as compile from "../../src/language/compile.js";

describe("OrigamiGraph", () => {
  test("graph from text", async () => {
    const fn = compile.graphDocument(`
      name = 'world'
      message = \`Hello, {{ name }}!\`
    `);
    const graph = await fn.call(null);
    assert.deepEqual(await GraphHelpers.plain(graph), {
      name: "world",
      message: "Hello, world!",
    });
  });

  test("graph can contain nested graph", async () => {
    const fn = compile.graphDocument(`
      public = {
        name = 'world'
        index.html = \`Hello, {{ name }}!\`
      }
    `);
    const graph = await fn.call(null);
    assert.deepEqual(await GraphHelpers.plain(graph), {
      public: {
        name: "world",
        "index.html": "Hello, world!",
      },
    });
    const indexHtml = await ExplorableGraph.traverse(
      graph,
      "public",
      "index.html"
    );
    assert.equal(indexHtml, "Hello, world!");
  });
});
