import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import AdditionsTransform from "../../src/framework/AdditionsTransform.js";
import FormulasTransform from "../../src/framework/FormulasTransform.js";
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

  it("lets subgraphs inherit values marked with `…`", async () => {
    const graph = new (AdditionsTransform(ObjectGraph))({
      "…a": 1,
      "…b": 2,
      subgraph: {
        "…b": 3, // Overrides ancestor value
        subsubgraph: {},
      },
    });
    assert.equal(await graph.get("…b"), 2);
    assert.equal(await ExplorableGraph.traverse(graph, "subgraph", "…b"), 3);
    assert.equal(
      await ExplorableGraph.traverse(graph, "subgraph", "subsubgraph", "…b"),
      3
    );
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
    assert.equal(await ExplorableGraph.traverse(graph, "a", "b"), 1);
    assert.equal(await ExplorableGraph.traverse(graph, "a", "c"), 2);
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

  //
  // TODO: Move to MetaTransform.test.js
  //

  it("can inherit formulas prefixed with `…`", async () => {
    const graph = new (FormulasTransform(AdditionsTransform(ObjectGraph)))({
      "…greeting = message": "",
      message: "Hello",
      spanish: {
        message: "Hola",
      },
    });
    assert.equal(await graph.get("greeting"), "Hello");
    const spanish = await graph.get("spanish");
    assert.equal(await spanish.get("greeting"), "Hola");
  });

  it("can define inherited additions with formulas", async () => {
    const graph = new (FormulasTransform(AdditionsTransform(ObjectGraph)))({
      "…a = this": "inherited",
      folder: {
        b: "local",
      },
    });
    const folder = await graph.get("folder");
    assert.equal(await folder.get("a"), "inherited");
    assert.equal(await folder.get("b"), "local");
  });

  it("can define peer additions with a formula", async () => {
    const graph = new (FormulasTransform(AdditionsTransform(ObjectGraph)))({
      folder: {
        a: "local",
      },
      "folder+ = this": new ObjectGraph({ b: "peer" }),
    });
    const folder = await graph.get("folder");
    assert.equal(await folder.get("a"), "local");
    assert.equal(await folder.get("b"), "peer");
  });
});
