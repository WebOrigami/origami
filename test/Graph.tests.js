import chai from "chai";
import Graph from "../src/Graph.js";
import ObjectGraph from "../src/ObjectGraph.js";
const { assert } = chai;

describe("Graph", () => {
  it("can return the keys for a graph", async () => {
    const graph = new ObjectGraph({
      a: "a",
      b: "b",
      c: "c",
    });
    assert.deepEqual(await graph.keys(), ["a", "b", "c"]);
  });

  it("can resolve the objects in a graph", async () => {
    const graph = new ObjectGraph({
      a: {
        b: {
          c: Promise.resolve("Hello"),
          d: "world",
        },
      },
    });
    const resolved = await graph.resolve();
    assert.deepEqual(resolved, {
      a: {
        b: {
          c: "Hello",
          d: "world",
        },
      },
    });
  });

  it("can return the text of the resolved objects in a graph", async () => {
    const graph = new ObjectGraph({
      string: "string",
      number: 1,
      numberPromise: Promise.resolve(2),
      boolean: true,
    });
    const resolved = await graph.resolveText();
    assert.deepEqual(resolved, {
      string: "string",
      number: "1",
      numberPromise: "2",
      boolean: "true",
    });
  });

  it("can traverse a set of keys", async () => {
    const graph = new ObjectGraph({
      a: {
        b: {
          c: Promise.resolve("Hello"),
        },
      },
    });
    const obj = await graph.traverse(["a", "b", "c"]);
    assert.equal(obj, "Hello");
    const doesntExist = await graph.traverse(["foo"]);
    assert.isUndefined(doesntExist);
  });

  it("toGraph helper casts its argument to a graph", () => {
    const fixture1 = Graph.from({ a: 1 });
    assert(fixture1 instanceof ObjectGraph);
    class TestGraph extends Graph {}
    const fixture2 = Graph.from(new TestGraph());
    assert(fixture2 instanceof TestGraph);
  });
});
