import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import PathTransform from "../../exports/PathTransform.js";
describe("PathTransform", () => {
  test("defines an ambient @path value for subgraphs", async () => {
    const graph = new (PathTransform(ObjectGraph))({
      a: {
        b: {
          c: {},
        },
      },
    });
    const result = await Graph.traverse(graph, "a", "b", "c");
    const path = await result.get("@path");
    assert.equal(path, "a/b/c");
  });
});
