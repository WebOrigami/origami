import PlusKeysMixin from "../../src/app/PlusKeysMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("PlusKeysMixin", () => {
  it("composes explorable values with + values", async () => {
    const graph = new (PlusKeysMixin(ExplorableObject))({
      "+more": {
        "+moreSub": {
          moreSub1: "sub one",
        },
        more1: "one",
        more2: "two",
      },
      a: {
        aSub: {
          aSub1: "sub 1",
        },
        a1: 1,
        a2: 2,
      },
      b: "not explorable",
    });
    const plain = await ExplorableGraph.plain(graph);
    assert.deepEqual(plain, {
      "+more": {
        more1: "one",
        more2: "two",
        "+moreSub": {
          moreSub1: "sub one",
        },
      },
      a: {
        aSub: {
          aSub1: "sub 1",
          moreSub1: "sub one",
        },
        a1: 1,
        a2: 2,
        "+moreSub": {
          moreSub1: "sub one",
        },
        more1: "one",
        more2: "two",
      },
      b: "not explorable",
    });
  });
});
