import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import {
  defineAmbientProperties,
  setScope,
} from "../../src/framework/scopeUtilities.js";
import assert from "../assert.js";

describe("scopeUtilities", () => {
  it("extends graph with ambient properties", async () => {
    const graph = new ExplorableObject({
      a: "Defined by graph",
    });
    const ambients = defineAmbientProperties(graph, {
      "@b": "Ambient property",
    });

    // Ambients graph doesn't expose any keys.
    assert.deepEqual(await ExplorableGraph.plain(ambients), {});

    // Scope of returned graph includes ambients + original graph values.
    assert.equal(await ambients.scope.get("a"), "Defined by graph");
    assert.equal(await ambients.scope.get("@b"), "Ambient property");
  });

  it("can define ambient properties even if it's not given a base graph", async () => {
    const extended = defineAmbientProperties(null, {
      "@b": "Ambient property",
    });

    // Graph should be empty.
    assert.deepEqual(await ExplorableGraph.plain(extended), {});

    // But extended graph can still provide the ambient properties.
    assert.equal(await extended.get("@b"), "Ambient property");
  });

  it("can apply scope to a primitive value after boxing it", async () => {
    const scope = new ExplorableObject({
      a: "Defined by scope",
    });
    const value = "value";
    const applied = setScope(value, scope);
    assert.equal(applied.toString(), "value");
    assert.equal(await applied.scope.get("a"), "Defined by scope");
  });
});
