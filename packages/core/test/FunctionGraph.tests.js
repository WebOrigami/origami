import chai from "chai";
import FunctionGraph from "../src/FunctionGraph.js";
const { assert } = chai;

describe("FunctionGraph", () => {
  it("invokes values which are functions, returns result", async () => {
    const graph = new FunctionGraph({
      a: 1,
      fn: function () {
        assert.equal(this, graph);
        return "Hello";
      },
    });
    assert.equal(await graph.get("a"), 1);
    assert.equal(await graph.get("fn"), "Hello");
  });
});
