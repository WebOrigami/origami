import { GraphHelpers } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import MapInnerKeysGraph from "../../src/common/MapInnerKeysGraph.js";

describe("MapInnerKeysGraph", () => {
  test("maps inner keys to outer keys", async () => {
    const graph = new MapInnerKeysGraph(
      {
        a: 1,
        b: 2,
        c: 3,
      },
      (value, key) => key.toUpperCase()
    );
    assert.deepEqual(await GraphHelpers.plain(graph), {
      A: 1,
      B: 2,
      C: 3,
    });
  });
});
