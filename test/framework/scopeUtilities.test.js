import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import {
  defineAmbientProperties,
  setScope,
} from "../../src/framework/scopeUtilities.js";
import assert from "../assert.js";

describe("defineAmbientProperties", () => {
  it("extends graph with ambient properties", async () => {
    const graph = new ExplorableObject({
      a: "Defined by graph",
    });
    const extended = defineAmbientProperties(graph, {
      "@b": "Ambient property",
    });

    // Extended graph should expose the same keys/values as the original.
    assert.deepEqual(await ExplorableGraph.plain(extended), {
      a: "Defined by graph",
    });

    // But extended graph can now get the ambient properties.
    assert.equal(await extended.get("a"), "Defined by graph");
    assert.equal(await extended.get("@b"), "Ambient property");
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
