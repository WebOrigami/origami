import PlusKeysMixin from "../../src/app/PlusKeysMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("PlusKeysMixin", () => {
  it("composes explorable values with + values", async () => {
    const graph = new (PlusKeysMixin(ExplorableObject))({
      "+more": {
        more1: "one",
        more2: "two",
      },
      a: {
        a1: 1,
        a2: 2,
      },
      b: "not explorable",
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      "+more": {
        more1: "one",
        more2: "two",
      },
      a: {
        a1: 1,
        a2: 2,
        more1: "one",
        more2: "two",
      },
      b: "not explorable",
    });
  });
});
