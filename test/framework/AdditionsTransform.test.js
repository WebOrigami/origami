import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import AdditionsTransform from "../../src/framework/AdditionsTransform.js";
import assert from "../assert.js";

describe("AdditionsTransform", () => {
  it("defines additional content with + key", async () => {
    const graph = new (AdditionsTransform(ObjectGraph))({
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

  it.only("adds all addition keys", async () => {
    const graph = new (AdditionsTransform(ObjectGraph))({
      "+": {
        a: 1,
      },
      "+.yaml": `b: 2`,
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
      "+": {
        a: 1,
      },
      "+.yaml": `b: 2`,
    });
  });
});
