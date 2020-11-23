import chai from "chai";
import ArrowTransformGraph from "../src/ArrowTransformGraph.js.js";
import ComposedGraph from "../src/ComposedGraph.js.js";
const { assert } = chai;

describe("ArrowTransformGraph", () => {
  it("filters objects whose keys are arrow declarations", async () => {
    const graph = new ArrowTransformGraph({
      "* upper ← * lower": "",
      a: "a",
      b: "b",
      "foo ← bar": "",
      c: "c",
    });
    assert.deepEqual(await graph.keys(), ["a", "b", "c"]);
  });

  it.skip("transforms its own objects", async () => {
    const graph = new ArrowTransformGraph({
      "* upper ← * lower": (obj) => obj.toUpperCase(),
      a: "a",
      "b lower": "this should become uppercase",
      c: "c",
      "d lower": "this should become uppercase too",
      e: "e",
    });
    const obj = await graph.resolve();
    assert.deepEqual(obj, {
      "b upper": "THIS SHOULD BECOME UPPERCASE",
      "d upper": "THIS SHOULD BECOME UPPERCASE TOO",
    });
  });

  it.skip("transforms composition", async () => {
    const graph = new ArrowTransformGraph(
      new ComposedGraph(
        {
          "* upper ← * lower": (obj) => obj.toUpperCase(),
        },
        {
          a: "a",
          "b lower": "this should become uppercase",
          c: "c",
          "d lower": "this should become uppercase too",
          e: "e",
        }
      )
    );
    const obj = graph.resolve();
    assert.deepEqual(obj, {
      "b upper": "THIS SHOULD BECOME UPPERCASE",
      "d upper": "THIS SHOULD BECOME UPPERCASE TOO",
    });
  });
});
