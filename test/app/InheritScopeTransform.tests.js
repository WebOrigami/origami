import InheritScopeTransform from "../../src/app/InheritScopeTransform.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("InheritScopeTransform", () => {
  it("creates a scope that includes a graph and its parent", async () => {
    const fixture = new (InheritScopeTransform(ExplorableObject))({
      b: 2,
    });
    fixture.parent = new ExplorableObject({
      a: 1,
    });
    assert.deepEqual(await fixture.scope.get("b"), 2);
    assert.deepEqual(await fixture.scope.get("a"), 1);
  });

  it("adds a subgraph's parent to the subgraphs's scope", async () => {
    const fixture = new (InheritScopeTransform(ExplorableObject))({
      a: 1,
      subgraph: {
        b: 2,
      },
    });
    const subgraph = await fixture.get("subgraph");
    assert.deepEqual(await subgraph.scope.get("b"), 2);
    assert.deepEqual(await subgraph.scope.get("a"), 1);
  });

  it.skip("sets isInScope on a graph when it's in the scope of another graph", async () => {
    const graph = new (InheritScopeTransform(ExplorableObject))({
      a: 1,
      subgraph: {
        b: 2,
      },
    });
    assert(!graph.isInScope);
    const subgraph = await graph.get("subgraph");
    assert(subgraph.scope.isInScope);
  });
});
