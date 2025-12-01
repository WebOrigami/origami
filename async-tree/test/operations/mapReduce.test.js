import assert from "node:assert";
import { describe, test } from "node:test";
import DeepObjectMap from "../../src/drivers/DeepObjectMap.js";
import mapReduce from "../../src/operations/mapReduce.js";
import values from "../../src/operations/values.js";

describe("mapReduce", () => {
  test("can map values and reduce them", async () => {
    const tree = new DeepObjectMap({
      a: 1,
      b: 2,
      more: {
        c: 3,
      },
      d: 4,
    });
    const reduced = await mapReduce(tree, null, async (mapped) =>
      String.prototype.concat(...(await values(mapped)))
    );
    assert.deepEqual(reduced, "1234");
  });
});
