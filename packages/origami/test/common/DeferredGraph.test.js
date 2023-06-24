import assert from "node:assert";
import { describe, test } from "node:test";
import ExplorableGraph from "../../src/core/ExplorableGraph.js"; // Entry point to circular dependencies

import { ObjectGraph } from "@graphorigami/core";
import DeferredGraph from "../../src/common/DeferredGraph.js";
describe("DeferredGraph", () => {
  test("Loads graph lazily", async () => {
    const graph = new DeferredGraph(async () => {
      return new ObjectGraph({
        a: 1,
        b: 2,
      });
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
    });
  });
});
