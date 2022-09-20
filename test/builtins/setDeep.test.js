import setDeep from "../../src/builtins/setDeep.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("setDeep", () => {
  it("can apply updates with a single argument to set", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      more: {
        d: 3,
      },
    });

    // Apply changes.
    await setDeep(graph, {
      a: 4, // Overwrite existing value
      b: undefined, // Delete
      c: 5, // Add
      more: {
        // Should leave existing `more` keys alone.
        e: 6, // Add
      },
      // Add new explorable value
      extra: {
        f: 7,
      },
    });

    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 4,
      c: 5,
      more: {
        d: 3,
        e: 6,
      },
      extra: {
        f: 7,
      },
    });
  });
});
