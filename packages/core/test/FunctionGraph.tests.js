import chai from "chai";
import FunctionGraph from "../src/FunctionGraph.js";
const { assert } = chai;

describe("FunctionGraph", () => {
  it("invokes values which are functions, returns result", async () => {
    const graph = new FunctionGraph({
      a: 1,
      fn: () => "Hello",
    });
    assert.equal(await graph.get("a"), 1);
    assert.equal(await graph.get("fn"), "Hello");
  });
});
