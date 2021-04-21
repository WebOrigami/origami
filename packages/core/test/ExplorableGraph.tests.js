import chai from "chai";
import ExplorableGraph from "../src/ExplorableGraph.js";
import ExplorableObject from "../src/ExplorableObject.js";
const { assert } = chai;

describe("ExplorableGraph", () => {
  it("can instantiate", async () => {
    const graph = new ExplorableGraph();
    assert.equal(await graph.get("hello"), undefined);
  });

  it("keys returns an array of the graph's keys", async () => {
    const fixture = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.deepEqual(await fixture.keys(), ["a", "b", "c"]);
  });

  it("mapValues() applies a mapping function to values", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const strings = await graph.mapValues((value) => String(value));
    assert.deepEqual(strings, {
      a: "1",
      b: "2",
      c: "3",
      more: {
        d: "4",
        e: "5",
      },
    });
  });

  it("plain() produces a plain object version of a graph", async () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    };
    const graph = new ExplorableObject(original);
    const plain = await graph.plain();
    assert.deepEqual(plain, original);
  });

  it("strings() converts graph values to strings", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const strings = await graph.strings();
    assert.deepEqual(strings, {
      a: "1",
      b: "2",
      c: "3",
      more: {
        d: "4",
        e: "5",
      },
    });
  });

  it("structure() produces a plain object version of an graph that has null values", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const structure = await graph.structure();
    assert.deepEqual(structure, {
      a: null,
      b: null,
      c: null,
      more: {
        d: null,
        e: null,
      },
    });
  });

  it("traverse() invokes a callback with each node in depth-first order", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const results = [];
    await graph.traverse(async (route, interior, value) => {
      results.push({
        route,
        interior,
        value: value instanceof ExplorableGraph ? await value.plain() : value,
      });
    });
    const plain = await Promise.all(results);
    assert.deepEqual(plain, [
      { route: ["a"], interior: false, value: 1 },
      { route: ["b"], interior: false, value: 2 },
      { route: ["c"], interior: false, value: 3 },
      { route: ["more"], interior: true, value: { d: 4, e: 5 } },
      { route: ["more", "d"], interior: false, value: 4 },
      { route: ["more", "e"], interior: false, value: 5 },
    ]);
  });
});
