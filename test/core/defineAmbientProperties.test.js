import { ExplorableGraph } from "../../exports.js";
import defineAmbientProperties from "../../src/core/defineAmbientProperties.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import InheritScopeTransform from "../../src/framework/InheritScopeTransform.js";
import assert from "../assert.js";

describe("defineAmbientProperties", () => {
  it("runs", async () => {
    const graph = new (InheritScopeTransform(ExplorableObject))({
      a: "Defined by graph",
    });
    const extended = defineAmbientProperties(graph, {
      "@b": "Ambient property",
    });

    // Extended graph should expose the same keys/values as the original.
    assert.deepEqual(await ExplorableGraph.plain(extended), {
      a: "Defined by graph",
    });

    // But scope should now include the ambient properties.
    assert.equal(await extended.scope.get("a"), "Defined by graph");
    assert.equal(await extended.scope.get("@b"), "Ambient property");
  });
});
