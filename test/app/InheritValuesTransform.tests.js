import FormulasTransform from "../../src/app/FormulasTransform.js";
import InheritScopeTransform from "../../src/app/InheritScopeTransform.js";
import InheritValuesTransform from "../../src/app/InheritValuesTransform.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("InheritValuesTransform", () => {
  it("lets subgraphs inherit values", async () => {
    const fixture = new (InheritValuesTransform(
      InheritScopeTransform(FormulasTransform(ExplorableObject))
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
