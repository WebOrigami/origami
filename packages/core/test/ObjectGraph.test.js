import assert from "node:assert";
import { describe, test } from "node:test";
import GraphHelpers from "../src/GraphHelpers.js";
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

  test("returns an ObjectGraph for value that's a plain sub-object or sub-array", async () => {
    const graph = new ObjectGraph({
      a: 1,
      object: {
        b: 2,
      },
      array: [3],
    });

    const object = await graph.get("object");
    assert.equal(object instanceof ObjectGraph, true);
    assert.deepEqual(await GraphHelpers.plain(object), { b: 2 });

    const array = await graph.get("array");
    assert.equal(array instanceof ObjectGraph, true);
    assert.deepEqual(await GraphHelpers.plain(array), [3]);
  });

  test("returns an async dictionary value as is", async () => {
    const dictionary = {
      async get(key) {
        return key === "b" ? 2 : undefined;
      },
      async keys() {
        return ["b"];
      },
    };
    const graph = new ObjectGraph({
      a: 1,
      dictionary,
    });
    assert.equal(await graph.get("dictionary"), dictionary);
  });

  test("can indicate which keys are for subgraphs", async () => {
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
