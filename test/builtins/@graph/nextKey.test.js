import nextKey from "../../../src/builtins/@graph/nextKey.js";
import assert from "../../assert.js";

describe("nextKey", () => {
  it("gets the next key in the graph", async () => {
    const graph = {
      a: null,
      b: null,
      c: null,
    };
    assert.equal(await nextKey.call(null, graph, "a"), "b");
    assert.equal(await nextKey.call(null, graph, "b"), "c");
    assert.equal(await nextKey.call(null, graph, "c"), undefined);
  });
});
