import FormulasTransform from "../../src/app/FormulasTransform.js";
import InheritedValuesTransform from "../../src/app/InheritedValuesTransform.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("InheritedValuesTransform", () => {
  it("lets subgraphs inheritable values", async () => {
    const fixture = new (InheritedValuesTransform(
      FormulasTransform(ExplorableObject)
    ))({
      "…a": 1,
      "…b": 2,
      subgraph: {
        "…b": 3, // Overrides ancestor value
        subsubgraph: {},
      },
    });

    assert.equal(await fixture.get("a"), 1);

    assert.equal(await ExplorableGraph.traverse(fixture, "subgraph", "a"), 1);
    assert.equal(await ExplorableGraph.traverse(fixture, "subgraph", "b"), 3);

    assert.equal(
      await ExplorableGraph.traverse(fixture, "subgraph", "subsubgraph", "a"),
      1
    );
    assert.equal(
      await ExplorableGraph.traverse(fixture, "subgraph", "subsubgraph", "b"),
      3
    );
  });
});
