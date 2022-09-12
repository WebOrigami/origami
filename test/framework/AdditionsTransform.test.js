import FileLoadersTransform from "../../src/common/FileLoadersTransform.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import AdditionsTransform from "../../src/framework/AdditionsTransform.js";
import KeysTransform from "../../src/framework/KeysTransform.js";
import assert from "../assert.js";

class AdditionsObject extends AdditionsTransform(KeysTransform(ObjectGraph)) {}

describe("AdditionsTransform", () => {
  it("defines child additions with + additions prefix", async () => {
    const graph = new AdditionsObject({
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
      subgraph: {
        c: 3,
        d: 4,
      },
    });
  });

  it("child additions can come from a different type of graph", async () => {
    const graph = new (FileLoadersTransform(AdditionsObject))({
      "+.yaml": `a: 1`,
    });
    assert.equal(await graph.get("a"), 1);
  });

  it("adds values from peer graphs marked with `+` extension", async () => {
    const graph = new AdditionsObject({
      a: {
        b: 1,
      },
      "a+": {
        // The values here will be merged into the `a` graph.
        c: 2,
      },
    });
    const a = await graph.get("a");
    assert.deepEqual(await ExplorableGraph.plain(a), {
      b: 1,
      c: 2,
    });
  });

  it("prefers local values, then child additions, then peers", async () => {
    const graph = new AdditionsObject({
      "folder+": {
        // Peer additions
        a: "peer",
        b: "peer",
        c: "peer",
      },
      folder: {
        "+childAdditions": {
          // Child additions
          a: "child",
          b: "child",
        },
        // Local values
        a: "local",
      },
    });
    const folder = await graph.get("folder");
    assert.deepEqual(await ExplorableGraph.plain(folder), {
      a: "local",
      b: "child",
      c: "peer",
    });
  });
});
