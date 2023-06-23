import assert from "node:assert";
import { describe, test } from "node:test";
import ObjectGraph from "../src/ObjectGraph.js";

describe("ObjectGraph", () => {
  test("creates an ObjectGraph for subgraphs", async () => {
    const object = {
      a: 1,
      more: {
        b: 2,
      },
    };
    const fixture = new ObjectGraph(object);
    const more = await fixture.get("more");
    assert.equal(more.constructor, ObjectGraph);
    const b = await more.get("b");
    assert.equal(b, 2);
  });

  test("isKeyForSubgraph() indicates which values are subgraphs", async () => {
    const graph = new ObjectGraph({
      a1: 1,
      a2: {
        b1: 2,
      },
      a3: 3,
      a4: {
        b2: 4,
      },
    });
    const keys = Array.from(await graph.keys());
    const valuesExplorable = await Promise.all(
      keys.map(async (key) => await graph.isKeyForSubgraph(key))
    );
    assert.deepEqual(valuesExplorable, [false, true, false, true]);
  });
});
