import { ExplorableGraph } from "../../exports.js";
import SubtractKeys from "../../src/common/SubtractKeys.js";
import assert from "../assert.js";

describe("SubtracKeys", () => {
  it("can remove keys from a graph", async () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    };
    const remove = {
      b: null,
      more: {
        d: "", // Doesn't matter what values are
      },
    };
    const difference = new SubtractKeys(original, remove);
    const plain = await ExplorableGraph.plain(difference);
    assert.deepEqual(plain, {
      a: 1,
      c: 3,
      more: {
        e: 5,
      },
    });
  });
});
