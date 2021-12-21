import InheritScopeTransform from "../../src/app/InheritScopeTransform.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("InheritScopeTransform", () => {
  // it("passes a scope to values that define a scope property", async () => {
  //   const graph = new (InheritScopeTransform(ExplorableObject))({
  //     a: 1,
  //     b: 2,
  //     subgraph: {
  //       // Will use `a` from scope.
  //       b: 3, // Will override `b` in scope.
  //       c: 4,
  //       more: {
  //         // Will have `a`, `b` (= 3), and `c` in scope.
  //         d: 5,
  //       },
  //     },
  //   });

  //   // Root graph can get only local values.
  //   assert.equal(await graph.get("a"), 1);
  //   assert.equal(await graph.get("b"), 2);

  //   // Subgraph can get its own values, plus inherited values.
  //   const subgraph = await graph.get("subgraph");
  //   assert.equal(await subgraph.get("a"), 1);
  //   assert.equal(await subgraph.get("b"), 3);
  //   assert.equal(await subgraph.get("c"), 4);

  //   // Sub-subgraph inherits everything.
  //   const more = await subgraph.get("more");
  //   assert.equal(await more.get("a"), 1);
  //   assert.equal(await more.get("b"), 3);
  //   assert.equal(await more.get("c"), 4);
  //   assert.equal(await more.get("d"), 5);
  // });

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
