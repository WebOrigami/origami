import assert from "node:assert";
import { describe, test } from "node:test";
import nextKey from "../../../src/builtins/@graph/nextKey.js";

describe("@graph/nextKey", () => {
  test("gets the next key in the graph", async () => {
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
