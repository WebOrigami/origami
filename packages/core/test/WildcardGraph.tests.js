import chai from "chai";
import { default as WildcardGraph } from "../src/WildcardGraph.js";
const { assert } = chai;

describe.only("WildcardGraph", () => {
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

  it("adds wildcard matches as params to explorable result", async () => {
    const graph = new WildcardGraph({
      ":wildcard": function (params) {
        assert.equal(this, graph);
        assert.equal(params.wildcard, "doesntexist");
        return "result";
      },
    });
    const value = await graph.get("doesntexist");
    assert.equal(value, "result");
  });

  it("composes explorable wildcard values", async () => {
    const graph = new WildcardGraph({
      ":fallback1": {
        a: 1,
      },
      ":fallback2": {
        b: 2,
      },
    });

    const subgraph = await graph.get("subgraph");
    assert.deepEqual(await subgraph.keys(), ["a", "b"]);

    // Real keys work.
    assert.equal(await graph.get(":fallback1", "a"), 1);

    // Wildcard keys work.
    assert.equal(await graph.get("subgraph", "a"), 1);
    assert.equal(await graph.get("subgraph", "b"), 2);
  });

  it("composes explorable real value and explorable wildcard values", async () => {
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

  it("if all wildcard values aren't composable, returns first wildcard", async () => {
    const graph = new WildcardGraph({
      ":fallback1": 1,
      ":fallback2": {
        a: 2,
      },
    });
    assert.equal(await graph.get("doesntexist"), 1);
  });

  it("handles nested wildcards", async () => {
    const graph = new WildcardGraph({
      real: {
        subreal: {
          a: 1,
        },
      },
      ":fallback": {
        ":subfallback": {
          b: 2,
        },
      },
    });

    const subsubgraph = await graph.get("real", "subreal");
    assert.deepEqual(await subsubgraph.keys(), ["a", "b"]);
  });

  it("parameters are passed down to subgraphs", async () => {
    const graph = new WildcardGraph({
      ":wildcard": {
        foo: function (params) {
          return params.wildcard;
        },
      },
    });
    const result = await graph.get("doesntexist", "foo");
    assert.equal(result, "doesntexist");
  });
});
