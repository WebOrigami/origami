import assert from "node:assert";
import { describe, test } from "node:test";
import * as Graph from "../src/Graph.js";
import MapGraph from "../src/MapGraph.js";
import ObjectGraph from "../src/ObjectGraph.js";

describe("Graph", () => {
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
    const result = await Graph.assign(target, source);

    assert.equal(result, target);
    assert.deepEqual(await Graph.plain(target), {
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
    await Graph.assign(target, ["d", "e"]);
    assert.deepEqual(await Graph.plain(target), ["d", "e", "c"]);
  });

  test("from() returns an async graph as is", async () => {
    const graph1 = new ObjectGraph({
      a: "Hello, a.",
    });
    const graph2 = Graph.from(graph1);
    assert.equal(graph2, graph1);
  });

  test("from() uses an object's unpack() method if defined", async () => {
    const obj = {
      unpack() {
        return {
          a: "Hello, a.",
        };
      },
    };
    const graph = Graph.from(obj);
    assert.deepEqual(await Graph.plain(graph), {
      a: "Hello, a.",
    });
  });

  test("from() creates a deferred graph if unpack() returns a promise", async () => {
    const obj = {
      async unpack() {
        return {
          a: "Hello, a.",
        };
      },
    };
    const graph = Graph.from(obj);
    assert.deepEqual(await Graph.plain(graph), {
      a: "Hello, a.",
    });
  });

  test("from() turns primitive value into graph with a default value", async () => {
    const graph = Graph.from("Hello");
    assert.deepEqual(await Graph.plain(graph), {
      // @ts-ignore
      [Graph.defaultValueKey]: "Hello",
    });
  });

  test("keysFromPath() returns the keys from a slash-separated path", () => {
    assert.deepEqual(Graph.keysFromPath("a/b/c"), ["a", "b", "c"]);
    assert.deepEqual(Graph.keysFromPath("foo/"), [
      "foo",
      Graph.defaultValueKey,
    ]);
  });

  test("isGraphable() returns true if the argument can be cast to an async graph", () => {
    assert(!Graph.isGraphable(null));
    assert(Graph.isGraphable({}));
    assert(Graph.isGraphable([]));
    assert(Graph.isGraphable(new Map()));
    assert(Graph.isGraphable(new Set()));
  });

  test("isKeyForSubgraph() returns true if the key is for a subgraph", async () => {
    const graph = new ObjectGraph({
      a: 1,
      more: {
        b: 2,
      },
    });
    assert(!(await Graph.isKeyForSubgraph(graph, "a")));
    assert(await Graph.isKeyForSubgraph(graph, "more"));
  });

  test("makeGraphable() returns a graphable object as is", () => {
    const obj = new ObjectGraph({});
    assert.equal(Graph.makeGraphable(obj), obj);
  });

  test("map() maps values", async () => {
    const graph = {
      a: "Alice",
      more: {
        b: "Bob",
      },
    };
    const mapped = await Graph.map(graph, (value) => value.toUpperCase());
    assert.deepEqual(await Graph.plain(mapped), {
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
    const reduced = await Graph.mapReduce(
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
    const plain = await Graph.plain(graph);
    assert.deepEqual(plain, original);
  });

  test("plain() produces an array for an array-like graph", async () => {
    const original = ["a", "b", "c"];
    const graph = new ObjectGraph(original);
    const plain = await Graph.plain(graph);
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
    const plain = await Graph.plain(graph);
    assert.deepEqual(plain, original);
  });

  test("toFunction returns a function that invokes a graph's get() method", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
    });
    const fn = Graph.toFunction(graph);
    assert.equal(await fn("a"), 1);
    assert.equal(await fn("b"), 2);
  });

  test("traverse() a path of keys", async () => {
    const graph = new ObjectGraph({
      a1: 1,
      a2: {
        b1: 2,
        b2: {
          c1: 3,
          c2: 4,
        },
      },
    });
    assert.equal(await Graph.traverse(graph), graph);
    assert.equal(await Graph.traverse(graph, "a1"), 1);
    assert.equal(await Graph.traverse(graph, "a2", "b2", "c2"), 4);
    assert.equal(
      await Graph.traverse(graph, "a2", "doesntexist", "c2"),
      undefined
    );
  });

  test("traverse() from one graph into another", async () => {
    const graph = new ObjectGraph({
      a: {
        b: new MapGraph([
          ["c", "Hello"],
          ["d", "Goodbye"],
        ]),
      },
    });
    assert.equal(await Graph.traverse(graph, "a", "b", "c"), "Hello");
  });

  test("traverse() binds traversed functions to `this`", async () => {
    const context = {};
    const graph = new ObjectGraph({
      bold: function (key) {
        assert.equal(this, context);
        return `**${key}**`;
      },
    });
    const result = await Graph.traverse.call(context, graph, "bold", "Hello");
    assert.equal(result, "**Hello**");
  });

  test("traversing the default key returns the graph itself", async () => {
    const graph = {
      async get() {},
      async keys() {},
    };
    const result = await Graph.traverse(graph, Graph.defaultValueKey);
    assert.equal(result, graph);
  });

  test("traversePath() traverses a slash-separated path", async () => {
    const graph = new ObjectGraph({
      a: {
        b: {
          c: "Hello",
        },
      },
    });
    assert.equal(await Graph.traversePath(graph, "a/b/c"), "Hello");
  });
});