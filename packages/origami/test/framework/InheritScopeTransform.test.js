import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import ExplorableGraph from "../../src/core/ExplorableGraph.js"; // Entry point to circular dependencies
import InheritScopeTransform from "../../src/framework/InheritScopeTransform.js";

// @ts-ignore
const triggerCircularDependency = ExplorableGraph;

describe("InheritScopeTransform", () => {
  test("creates a scope that includes a graph and its parent", async () => {
    const fixture = new (InheritScopeTransform(ObjectGraph))({
      b: 2,
    });
    fixture.parent = new ObjectGraph({
      a: 1,
    });
    assert.deepEqual(await fixture.scope?.get("b"), 2);
    assert.deepEqual(await fixture.scope?.get("a"), 1);
  });

  test("adds a subgraph's parent to the subgraphs's scope", async () => {
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
