import reverse from "../../src/builtins/reverse.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("reverse", () => {
  it("reverses a graph's top-level keys", async () => {
    const graph = {
      a: "A",
      b: "B",
      c: "C",
    };
    const reversed = reverse(graph);
    assert.deepEqual(await ExplorableGraph.keys(reversed), ["c", "b", "a"]);
    assert.deepEqual(await ExplorableGraph.plain(reversed), {
      c: "C",
      b: "B",
      a: "A",
    });
  });
});
