import Scope from "../../src/common/Scope.js";
import assert from "../assert.js";

describe("Scope", () => {
  it("composes and flattens scopes and graphs passed to it", async () => {
    const graphA = {
      a: 1,
    };
    const graphB = {
      b: 2,
    };
    const graphC = {
      c: 3,
    };
    const scope1 = new Scope(graphA, graphB);
    const scope2 = new Scope(scope1, graphC);
    const objects = scope2.graphs.map(
      (graph) => /** @type {any} */ (graph).object
    );
    assert.deepEqual(objects, [graphA, graphB, graphC]);
  });

  it("sets isInScope on all graphs in scope but the first", async () => {
    const graphA = {
      a: 1,
    };
    const graphB = {
      b: 2,
    };
    const graphC = {
      c: 3,
    };
    const scope = new Scope(graphA, graphB, graphC);
    /** @type {any[]} */
    const graphs = scope.graphs;
    assert.equal(!!graphs[0].isInScope, false);
    assert.equal(graphs[1].isInScope, true);
    assert.equal(graphs[2].isInScope, true);
  });
});
