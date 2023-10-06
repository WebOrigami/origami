import assert from "node:assert";
import { describe, test } from "node:test";
import valuesDeep from "../../../src/builtins/@graph/valuesDeep.js";

describe("@graph/valuesDeep", () => {
  test("returns in-order array of a graph's values", async () => {
    const graph = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
      f: {
        g: 4,
      },
    };
    const values = await valuesDeep.call(null, graph);
    assert.deepEqual(values, [1, 2, 3, 4]);
  });
});