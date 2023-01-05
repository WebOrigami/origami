import previousKey from "../../src/builtins/previousKey.js";
import assert from "../assert.js";

describe("previousKey", () => {
  it("gets the previous key in the graph", async () => {
    const graph = {
      a: null,
      b: null,
      c: null,
    };
    assert.equal(await previousKey(graph, "a"), undefined);
    assert.equal(await previousKey(graph, "b"), "a");
    assert.equal(await previousKey(graph, "c"), "b");
  });
});
