import ObjectGraph from "../../src/core/ObjectGraph.js";
import InheritScopeTransform from "../../src/framework/InheritScopeTransform.js";
import assert from "../assert.js";

describe("InheritScopeTransform", () => {
  it("creates a scope that includes a graph and its parent", async () => {
    const fixture = new (InheritScopeTransform(ObjectGraph))({
      b: 2,
    });
    fixture.parent = new ObjectGraph({
      a: 1,
    });
    assert.deepEqual(await fixture.scope.get("b"), 2);
    assert.deepEqual(await fixture.scope.get("a"), 1);
  });

  it("adds a subgraph's parent to the subgraphs's scope", async () => {
    const fixture = new (InheritScopeTransform(ObjectGraph))({
      a: 1,
      subgraph: {
        b: 2,
      },
    });
    const subgraph = await fixture.get("subgraph");
    assert.deepEqual(await subgraph.scope.get("b"), 2);
    assert.deepEqual(await subgraph.scope.get("a"), 1);
  });
});
