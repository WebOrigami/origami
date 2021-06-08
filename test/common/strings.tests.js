import chai from "chai";
import strings from "../../src/common/strings.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
const { assert } = chai;

describe("strings transform", () => {
  it("transforms graph values to strings", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const plain = await ExplorableGraph.plain(strings(graph));
    assert.deepEqual(plain, {
      a: "1",
      b: "2",
      c: "3",
      more: {
        d: "4",
        e: "5",
      },
    });
  });
});
