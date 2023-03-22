import paths from "../../../src/builtins/@graph/paths.js";
import assert from "../../assert.js";

describe("@paths", () => {
  it("returns an array of paths to the values in the graph", async () => {
    const graph = {
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: 4,
      },
    };
    assert.deepEqual(await paths.call(null, graph), ["a", "b", "c/d", "c/e"]);
  });
});
