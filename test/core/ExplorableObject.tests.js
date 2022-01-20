import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("ExplorableObject", () => {
  it("can async explore a plain JavaScript object", async () => {
    const graph = new ExplorableObject({
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

  it("can set a value", async () => {
    const graph = new ExplorableObject({
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

  it("can apply updates with a single argument to set", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
    });

    // Apply changes.
    await graph.set({
      a: 4,
      b: undefined,
      d: 5,
      more: {
        e: 6,
      },
    });

    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 4,
      c: 3,
      d: 5,
      more: {
        e: 6,
      },
    });
  });

  it("distinguishes between setting an explorable value and apply updates", async () => {
    const graph1 = new ExplorableObject({
      a: 1,
      more: {
        b: 2,
      },
    });

    // Setting key by name overwrites any existing value.
    await graph1.set(
      "more",
      new ExplorableObject({
        c: 3,
      })
    );

    assert.deepEqual(await ExplorableGraph.plain(graph1), {
      a: 1,
      more: {
        c: 3,
      },
    });

    const graph2 = new ExplorableObject({
      a: 1,
      more: {
        b: 2,
      },
    });

    // Passing an explorable as the single argument applies it as updates.
    await graph2.set(
      new ExplorableObject({
        more: {
          c: 3,
        },
      })
    );

    assert.deepEqual(await ExplorableGraph.plain(graph2), {
      a: 1,
      more: {
        b: 2,
        c: 3,
      },
    });
  });

  it("can indicate which values are explorable", async () => {
    const graph = new ExplorableObject({
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
});
