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

  it("gets the first defined value from the scope graphs", async () => {
    const scope = new Scope(
      {
        a: 1,
      },
      {
        a: 2,
        b: 3,
      }
    );
    assert.equal(await scope.get("a"), 1);
    assert.equal(await scope.get("b"), 3);
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

  it("binds functions to the scope", async () => {
    const scope = new Scope({
      fn: function () {
        return this;
      },
    });
    const fn = await scope.get("fn");
    const result = fn();
    assert.equal(result, scope);
  });
});
