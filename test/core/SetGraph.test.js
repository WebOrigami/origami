import assert from "node:assert";
import { describe, test } from "node:test";
import SetGraph from "../../src/core/SetGraph.js";

describe("SetGraph", () => {
  test("treats a set as an array", async () => {
    const set = new Set(["a", "b", "c"]);
    const graph = new SetGraph(set);
    assert.deepEqual([...(await graph.keys())], [0, 1, 2]);
    assert.equal(await graph.get(0), "a");
    assert.equal(await graph.get(1), "b");
    assert.equal(await graph.get(2), "c");
  });
});
