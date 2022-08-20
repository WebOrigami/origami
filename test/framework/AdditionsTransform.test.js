import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import AdditionsTransform from "../../src/framework/AdditionsTransform.js";
import FileLoadersTransform from "../../src/node/FileLoadersTransform.js";
import assert from "../assert.js";

describe("AdditionsTransform", () => {
  it("defines child additions with + additions prefix", async () => {
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
    assert.equal(await graph.get("a"), 1);
    assert.equal(await graph.get("b"), 2);
    assert.equal(await ExplorableGraph.traverse(graph, "subgraph", "c"), 3);
    assert.equal(await ExplorableGraph.traverse(graph, "subgraph", "d"), 4);
  });

  it("child additions can come from a different type of graph", async () => {
    const graph = new (FileLoadersTransform(AdditionsTransform(ObjectGraph)))({
      "+.yaml": `a: 1`,
    });
    assert.equal(await graph.get("a"), 1);
  });

  it("adds values from peer graphs marked with `+` extension", async () => {
    const graph = new (AdditionsTransform(ObjectGraph))({
      a: {
        b: 1,
      },
      "a+": {
        // The values here will be merged into the `a` graph.
        c: 2,
      },
    });
    const a = await graph.get("a");
    assert.equal(await a.get("b"), 1);
    assert.equal(await a.get("c"), 2);
  });

  it("prefers local values, then child additions, then peers", async () => {
    const graph = new (AdditionsTransform(ObjectGraph))({
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
    assert.equal(await folder.get("a"), "local");
    assert.equal(await folder.get("b"), "child");
    assert.equal(await folder.get("c"), "peer");
  });
});
