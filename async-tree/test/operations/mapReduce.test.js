import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectTree from "../../src/drivers/DeepObjectTree.js";
import mapReduce from "../../src/operations/mapReduce.js";

describe("mapReduce", () => {
  test("can map values and reduce them", async () => {
    const tree = new DeepObjectTree({
      a: 1,
      b: 2,
      more: {
        c: 3,
      },
      d: 4,
    });
    const reduced = await mapReduce(
      tree,
      (value) => value,
      async (values) => String.prototype.concat(...values)
    );
    assert.deepEqual(reduced, "1234");
  });
});
