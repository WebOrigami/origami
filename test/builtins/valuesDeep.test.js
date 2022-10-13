import valuesDeep from "../../src/builtins/valuesDeep.js";
import assert from "../assert.js";

describe("valuesDeep", () => {
  it("returns in-order array of a graph's values", async () => {
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
    const values = await valuesDeep(graph);
    assert.deepEqual(values, [1, 2, 3, 4]);
  });
});
