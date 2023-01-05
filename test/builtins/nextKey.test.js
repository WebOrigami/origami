import nextKey from "../../src/builtins/nextKey.js";
import assert from "../assert.js";

describe("nextKey", () => {
  it("gets the next key in the graph", async () => {
    const graph = {
      a: null,
      b: null,
      c: null,
    };
    assert.equal(await nextKey(graph, "a"), "b");
    assert.equal(await nextKey(graph, "b"), "c");
    assert.equal(await nextKey(graph, "c"), undefined);
  });
});
