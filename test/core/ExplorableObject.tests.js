import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("ExplorableObject", () => {
  it("can async explore a plain JavaScript object", async () => {
    const obj = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.equal(await obj.get2("a"), 1);
    assert.equal(await obj.get2("b"), 2);
    assert.equal(await obj.get2("c"), 3);
    assert.equal(await obj.get2("x"), undefined);

    const keys = [];
    for await (const key of obj) {
      keys.push(key);
    }
    assert.deepEqual(keys, ["a", "b", "c"]);
  });

  it("can set a value", async () => {
    const obj = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });

    // Set key, value.
    await obj.set("a", 5);

    // New key.
    await obj.set("f", 7);

    // Set deep key, value.
    await obj.set("more", "g", 8);

    assert.deepEqual(await ExplorableGraph.plain(obj), {
      a: 5,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
        g: 8,
      },
      f: 7,
    });
  });

  it("can set an explorable value", async () => {
    const obj = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
    });
    const more = new ExplorableObject({
      more: {
        d: 4,
        e: 5,
      },
    });

    // Set key, value.
    await obj.set(more);

    assert.deepEqual(await ExplorableGraph.plain(obj), {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
  });

  it("set can delete a key if the value is explicitly undefined", async () => {
    const obj = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });

    // One arg deletes key.
    await obj.set("a");

    // Explicit undefined value deletes key.
    await obj.set("b", undefined);

    // Deep deletion
    await obj.set("more", "d", undefined);

    assert.deepEqual(await ExplorableGraph.plain(obj), {
      c: 3,
      more: {
        e: 5,
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
