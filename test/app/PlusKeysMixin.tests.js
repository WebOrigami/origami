import PlusKeysMixin from "../../src/app/PlusKeysMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("PlusKeysMixin", () => {
  it("composes explorable values with + values", async () => {
    const graph = new (PlusKeysMixin(ExplorableObject))({
      "+a": {
        "+sub": {
          plusSub1: "sub one",
        },
        plus1: "one",
        plus2: "two",
      },
      a: {
        sub: {
          aSub1: "sub 1",
        },
        a1: 1,
        a2: 2,
      },
      b: "not explorable",
    });
    const plain = await ExplorableGraph.plain(graph);
    assert.deepEqual(plain, {
      "+a": {
        plus1: "one",
        plus2: "two",
        "+sub": {
          plusSub1: "sub one",
        },
      },
      a: {
        sub: {
          aSub1: "sub 1",
          plusSub1: "sub one",
        },
        a1: 1,
        a2: 2,
        "+sub": {
          plusSub1: "sub one",
        },
        plus1: "one",
        plus2: "two",
      },
      b: "not explorable",
    });
  });
});
