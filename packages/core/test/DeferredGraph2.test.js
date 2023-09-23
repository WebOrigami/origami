import assert from "node:assert";
import { describe, test } from "node:test";
import DeferredGraph2 from "../src/DeferredGraph2.js";
import * as Graph from "../src/Graph.js";

describe("DeferredGraph2", () => {
  test("lazy-loads a graphable object", async () => {
    const graph = new DeferredGraph2(async () => ({ a: 1, b: 2, c: 3 }));
    assert.deepEqual(await Graph.plain(graph), { a: 1, b: 2, c: 3 });
  });
});
