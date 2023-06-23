import assert from "node:assert";
import { describe, test } from "node:test";
import GraphHelpers from "../src/GraphHelpers.js";
import MapGraph from "../src/MapGraph.js";
import ObjectGraph from "../src/ObjectGraph.js";

describe("GraphHelpers", () => {
  test("assign applies one graph to another", async () => {
    const target = new ObjectGraph({
      a: 1,
      b: 2,
      more: {
        d: 3,
      },
    });

    const source = {
      a: 4, // Overwrite existing value
      b: undefined, // Delete
      c: 5, // Add
      more: {
        // Should leave existing `more` keys alone.
        e: 6, // Add
      },
      // Add new subgraph
      extra: {
        f: 7,
      },
    };

    // Apply changes.
    const result = await GraphHelpers.assign(target, source);

    assert.equal(result, target);
    assert.deepEqual(await GraphHelpers.plain(target), {
      a: 4,
      c: 5,
      more: {
        d: 3,
        e: 6,
      },
      extra: {
        f: 7,
      },
    });
  });

  test("assign can apply updates to an array", async () => {
    const target = new ObjectGraph(["a", "b", "c"]);
    await GraphHelpers.assign(target, ["d", "e"]);
    assert.deepEqual(await GraphHelpers.plain(target), ["d", "e", "c"]);
  });

  test("from() returns an async graph as is", async () => {
    const graph1 = new ObjectGraph({
      a: "Hello, a.",
    });
    const graph2 = GraphHelpers.from(graph1);
    assert.equal(graph2, graph1);
  });

  test("from() uses an object's toGraph() method if defined", async () => {
    const obj = {
      toGraph() {
        return {
          a: "Hello, a.",
        };
      },
    };
    const graph = GraphHelpers.from(obj);
    assert.deepEqual(await GraphHelpers.plain(graph), {
      a: "Hello, a.",
    });
  });

  test("keysFromPath() returns the keys from a slash-separated path", () => {
    assert.deepEqual(GraphHelpers.keysFromPath("a/b/c"), ["a", "b", "c"]);
    assert.deepEqual(GraphHelpers.keysFromPath("foo/"), ["foo", undefined]);
  });

  test("isGraphable() returns true if the argument can be cast to an async graph", () => {
    assert(!GraphHelpers.isGraphable(null));
    assert(GraphHelpers.isGraphable({}));
    assert(GraphHelpers.isGraphable([]));
    assert(GraphHelpers.isGraphable(new Map()));
    assert(GraphHelpers.isGraphable(new Set()));
  });

  test("isKeyForSubgraph() returns true if the key is for a subgraph", async () => {
    const graph = new ObjectGraph({
      a: 1,
      more: {
        b: 2,
      },
    });
    assert(!(await GraphHelpers.isKeyForSubgraph(graph, "a")));
    assert(await GraphHelpers.isKeyForSubgraph(graph, "more"));
  });

  test("map() maps values", async () => {
    const graph = {
      a: "Alice",
      more: {
        b: "Bob",
      },
    };
    const mapped = await GraphHelpers.map(graph, (value) =>
      value.toUpperCase()
    );
    assert.deepEqual(await GraphHelpers.plain(mapped), {
      a: "ALICE",
      more: {
        b: "BOB",
      },
    });
  });

  test("mapReduce() can map values and reduce them", async () => {
    const graph = {
      a: 1,
      b: 2,
      more: {
        c: 3,
      },
      d: 4,
    };
    const reduced = await GraphHelpers.mapReduce(
      graph,
      (value) => value,
      (values) => String.prototype.concat(...values)
    );
    assert.deepEqual(reduced, "1234");
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
    assert.equal(await GraphHelpers.traverse(obj), obj);
    assert.equal(await GraphHelpers.traverse(obj, "a1"), 1);
    assert.equal(await GraphHelpers.traverse(obj, "a2", "b2", "c2"), 4);
    assert.equal(
      await GraphHelpers.traverse(obj, "a2", "doesntexist", "c2"),
      undefined
    );
  });

  test("traverse() from one graph into another", async () => {
    const obj = new ObjectGraph({
      a: {
        b: new MapGraph([
          ["c", "Hello"],
          ["d", "Goodbye"],
        ]),
      },
    });
    assert.equal(await GraphHelpers.traverse(obj, "a", "b", "c"), "Hello");
  });
});
