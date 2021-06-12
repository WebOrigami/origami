import InvokeFunctionsMixin from "../../src/common/InvokeFunctionsMixin.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("InvokeFunctionsMixin", () => {
  it("invokes values which are functions, returns result", async () => {
    class FunctionsGraph extends InvokeFunctionsMixin(ExplorableObject) {}
    const graph = new FunctionsGraph({
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
