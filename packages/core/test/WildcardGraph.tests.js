import chai from "chai";
import WildcardGraph from "../src/WildcardGraph.js";
const { assert } = chai;

describe("WildcardGraph", () => {
  it("hides wildcards from keys", async () => {
    const graph = new WildcardGraph({
      ":default": 0,
      a: 1,
      b: 2,
      c: 3,
    });

    assert.deepEqual(await graph.keys(), ["a", "b", "c"]);

    // Can still get values
    assert.equal(await graph.get("a"), 1);
    assert.equal(await graph.get(":default"), 0);
  });

  it("returns wildcard values if requested key is missing", async () => {
    const graph = new WildcardGraph({
      ":default": 0,
      a: 1,
      b: 2,
      c: 3,
    });

    // Real key takes priority.
    assert.equal(await graph.get("a"), 1);

    // Missing key results in wildcard value.
    assert.equal(await graph.get("d"), 0);
  });

  it("can return parameters used to obtain a value", async () => {
    const graph = new WildcardGraph({
      ":wildcard": function (graph, params) {
        return params.wildcard;
      },
    });
    const fn = await graph.get("foo");
    const result = fn();
    assert.equal(result, "foo");
  });

  it("handles explorable wildcard values", async () => {
    const graph = new WildcardGraph({
      subgraph: {
        a: 1,
        b: 2,
        c: 3,
      },
      ":fallback1": {
        d: 4,
      },
      ":fallback2": {
        e: 5,
      },
    });

    const subgraph = await graph.get("subgraph");
    assert.deepEqual(await subgraph.keys(), ["a", "b", "c", "d", "e"]);

    // Real keys work.
    assert.equal(await graph.get("subgraph", "a"), 1);

    // Wildcard keys work.
    assert.equal(await graph.get("subgraph", "d"), 4);
    assert.equal(await graph.get("subgraph", "e"), 5);
  });

  it("handles nested wildcards", async () => {
    const graph = new WildcardGraph({
      subgraph: {
        subsubgraph: {
          a: 1,
        },
      },
      ":fallback": {
        ":fallbacksub": {
          b: 2,
        },
      },
    });

    const subsubgraph = await graph.get("subgraph", "subsubgraph");
    assert.deepEqual(await subsubgraph.keys(), ["a", "b"]);
  });
});
