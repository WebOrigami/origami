import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
describe("ExplorableGraph", () => {
  test("isKeyExplorable() indicates whether a key is expected to produce an explorable value", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: {
        c: 2,
      },
    });
    assert(!(await GraphHelpers.isKeyForSubgraph(graph, "a")));
    assert(await GraphHelpers.isKeyForSubgraph(graph, "b"));
  });

  test("plain() produces a plain object version of a graph", async () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    };
    const graph = new ObjectGraph(original);
    const plain = await GraphHelpers.plain(graph);
    assert.deepEqual(plain, original);
  });

  test("plain() produces an array for an array-like graph", async () => {
    const original = ["a", "b", "c"];
    const graph = new ObjectGraph(original);
    const plain = await GraphHelpers.plain(graph);
    assert.deepEqual(plain, original);
  });

  test("plain() leaves an array-like graph as an object if keys aren't consecutive", async () => {
    const original = {
      0: "a",
      1: "b",
      // missing
      3: "c",
    };
    const graph = new ObjectGraph(original);
    const plain = await GraphHelpers.plain(graph);
    assert.deepEqual(plain, original);
  });

  test("traverse() a path of keys", async () => {
    const obj = new ObjectGraph({
      a1: 1,
      a2: {
        b1: 2,
        b2: {
          c1: 3,
          c2: 4,
        },
      },
    });
    assert.equal(await ExplorableGraph.traverse(obj), obj);
    assert.equal(await ExplorableGraph.traverse(obj, "a1"), 1);
    assert.equal(await ExplorableGraph.traverse(obj, "a2", "b2", "c2"), 4);
    assert.equal(
      await ExplorableGraph.traverse(obj, "a2", "doesntexist", "c2"),
      undefined
    );
  });

  test("traverse() from one explorable into another", async () => {
    const obj = new ObjectGraph({
      a1: {
        a2: new ObjectGraph({
          b1: {
            b2: 1,
          },
        }),
      },
    });
    assert.equal(
      await ExplorableGraph.traverse(obj, "a1", "a2", "b1", "b2"),
      1
    );
  });

  test("values() returns an iterator for the graph's values", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.deepEqual(Array.from(await graph.keys()), ["a", "b", "c"]);
  });
});
