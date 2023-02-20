import builtins from "../../src/cli/builtins.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import OriCommandTransform from "../../src/framework/OriCommandTransform.js";
import assert from "../assert.js";

describe("OriCommandTransform", () => {
  it("prefers value defined by base graph even if it starts with '!'", async () => {
    const graph = new (OriCommandTransform(ObjectGraph))({
      "!yaml": "foo",
    });
    const value = await graph.get("!yaml");
    assert.equal(value, "foo");
  });

  it("evaluates an Origami expression in the graph's scope", async () => {
    const graph = new (OriCommandTransform(ObjectGraph))({
      a: 1,
      b: 2,
    });
    graph.scope = builtins;
    const value = await graph.get("!keys");
    assert.deepEqual(await ExplorableGraph.plain(value), ["a", "b"]);
  });
});
