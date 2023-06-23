import assert from "node:assert";
import { describe, test } from "node:test";
import paths from "../../../src/builtins/@graph/paths.js";

describe("@graph/paths", () => {
  test("returns an array of paths to the values in the graph", async () => {
    const graph = {
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: 4,
      },
    };
    assert.deepEqual(await paths.call(null, graph), ["a", "b", "c/d", "c/e"]);
  });
});
