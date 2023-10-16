import assert from "node:assert";
import { describe, test } from "node:test";
import valuesDeep from "../../../src/builtins/@tree/valuesDeep.js";

describe("@tree/valuesDeep", () => {
  test("returns in-order array of a tree's values", async () => {
    const tree = {
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
    const values = await valuesDeep.call(null, tree);
    assert.deepEqual(values, [1, 2, 3, 4]);
  });
});
