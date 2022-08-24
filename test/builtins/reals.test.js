import reals from "../../src/builtins/reals.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("reals", () => {
  it("returns only the real portion of a graph", async () => {
    const fixture = {
      "a = b": "",
      b: "Hello",
    };
    const result = await reals(fixture);
    assert.deepEqual(await ExplorableGraph.plain(result), {
      b: "Hello",
    });
  });
});
