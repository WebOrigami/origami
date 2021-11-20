import AdditionsMixin from "../../src/app/AdditionsMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("AdditionsMixin", () => {
  it("defines additional content with + key", async () => {
    const graph = new (AdditionsMixin(ExplorableObject))({
      a: 1,
      "+": {
        b: 2,
      },
      subgraph: {
        c: 3,
        "+": {
          d: 4,
        },
      },
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
      "+": {
        b: 2,
      },
      subgraph: {
        c: 3,
        d: 4,
        "+": {
          d: 4,
        },
      },
    });
  });
});
