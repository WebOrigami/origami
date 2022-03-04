import ExplorableArray from "../../src/core/ExplorableArray.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("ExplorableArray", () => {
  it("can explore a standard JavaScript Array", async () => {
    const graph = new ExplorableArray(["a", "b", "c"]);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      0: "a",
      1: "b",
      2: "c",
    });
  });
});
