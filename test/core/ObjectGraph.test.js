import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("ObjectGraph", () => {
  it("can async explore a plain JavaScript object", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.equal(await graph.get("a"), 1);
    assert.equal(await graph.get("b"), 2);
    assert.equal(await graph.get("c"), 3);
    assert.equal(await graph.get("x"), undefined);

    const keys = [];
    for await (const key of graph) {
      keys.push(key);
    }
    assert.deepEqual(keys, ["a", "b", "c"]);
  });

  it("can explore a standard JavaScript Array", async () => {
    const graph = new ObjectGraph(["a", "b", "c"]);
    assert.deepEqual(await ExplorableGraph.plain(graph), ["a", "b", "c"]);
  });

  it("get(undefined) returns the graph itself", async () => {
    const graph = new ObjectGraph({});
    assert.equal(await graph.get(undefined), graph);
  });

  it("can set a value", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
    });

    // Update existing key.
    await graph.set("a", 4);

    // New key.
    await graph.set("d", 5);

    // Delete key.
    await graph.set("b", undefined);

    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 4,
      c: 3,
      d: 5,
    });
  });

  it("returns an ObjectGraph for value that's a plain sub-object or sub-array", async () => {
    const graph = new ObjectGraph({
      a: 1,
      object: {
        b: 2,
      },
      array: [3],
    });

    const object = await graph.get("object");
    assert.equal(object instanceof ObjectGraph, true);
    assert.deepEqual(await ExplorableGraph.plain(object), { b: 2 });

    const array = await graph.get("array");
    assert.equal(array instanceof ObjectGraph, true);
    assert.deepEqual(await ExplorableGraph.plain(array), [3]);
  });

  it("returns an explorable value as is", async () => {
    const explorable = {
      async *[Symbol.asyncIterator]() {
        yield "b";
      },
      async get(key) {
        return key === "b" ? 2 : undefined;
      },
    };
    const graph = new ObjectGraph({
      a: 1,
      explorable,
    });
    assert.equal(await graph.get("explorable"), explorable);
  });

  it("can indicate which values are explorable", async () => {
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
    const keys = await ExplorableGraph.keys(graph);
    const valuesExplorable = await Promise.all(
      keys.map(async (key) => await graph.isKeyExplorable(key))
    );
    assert.deepEqual(valuesExplorable, [false, true, false, true]);
  });

  it.only("can wrap a class instance", async () => {
    class Foo {
      constructor() {
        this.a = 1;
      }

      get prop() {
        return this._prop;
      }
      set prop(prop) {
        this._prop = prop;
      }
    }
    class Bar extends Foo {
      method() {}
    }
    const bar = new Bar();
    /** @type {any} */ (bar).extra = "Hello";
    const graph = new ObjectGraph(bar);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      extra: "Hello",
      prop: undefined,
    });
    assert.equal(await graph.get("a"), 1);
    await graph.set("prop", "Goodbye");
    assert.equal(bar.prop, "Goodbye");
    assert.equal(await graph.get("prop"), "Goodbye");
  });
});
