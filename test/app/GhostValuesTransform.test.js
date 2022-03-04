import FormulasTransform from "../../src/app/FormulasTransform.js";
import GhostValuesTransform from "../../src/app/GhostValuesTransform.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

class GhostValuesObject extends GhostValuesTransform(ExplorableObject) {}
class GhostFormulasObject extends FormulasTransform(
  GhostValuesTransform(ExplorableObject)
) {}

describe("GhostValuesTransform", () => {
  it("treats ghost values as if present in main graph", async () => {
    const graph = new GhostValuesObject({
      a: 1,
    });
    // This will add 2 sets of ghost values to the above graph.
    graph.ghostGraphs = [
      new ExplorableObject({
        a: 0, // Shouldn't affect anything
        b: 2,
      }),
      new ExplorableObject({
        c: 3,
      }),
    ];
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it("adds ghost graphs from formulas to subgraphs", async () => {
    const graph = new GhostFormulasObject({
      "{x}+": {
        b: 2,
      },
      "{y}+": {
        c: 3,
      },
      subgraph: {
        a: 1,
      },
    });
    const subgraph = await graph.get("subgraph");
    assert.deepEqual(await ExplorableGraph.plain(subgraph), {
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it("allows nested ghost graphs", async () => {
    const graph = new GhostFormulasObject({
      "{x}+": {
        c: 3,
        "{y}+": {
          d: 4,
        },
      },
      subgraph: {
        a: 1,
        subsubgraph: {
          b: 2,
        },
      },
    });
    const subgraph = await graph.get("subgraph");
    assert.deepEqual(await ExplorableGraph.keys(subgraph), [
      "a",
      "c",
      "subsubgraph",
    ]);
    const subsubgraph = await subgraph.get("subsubgraph");
    assert.deepEqual(await ExplorableGraph.plain(subsubgraph), {
      b: 2,
      d: 4,
    });
  });

  it("parameters are passed down to ghost graphs", async () => {
    const graph = new GhostFormulasObject({
      "{x}+": {
        "{y}+": {
          "value = `{{x}}-{{y}}`": "",
        },
      },
      foo: {
        bar: {},
      },
    });
    const value = await ExplorableGraph.traverse(graph, "foo", "bar", "value");
    assert.equal(value, "foo-bar");
  });
});
