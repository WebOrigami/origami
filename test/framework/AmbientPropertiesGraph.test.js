import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import AmbientPropertiesGraph from "../../src/framework/AmbientPropertiesGraph.js";
import assert from "../assert.js";

describe("AmbientPropertiesGraph", () => {
  it("provides properties without exposing them in iterator", async () => {
    const ambients = new AmbientPropertiesGraph({
      "@a": "Ambient property",
    });

    // Ambients graph doesn't expose any keys.
    assert.deepEqual(await ExplorableGraph.plain(ambients), {});

    // But keys are available.
    assert.equal(await ambients.get("@a"), "Ambient property");
  });
});
