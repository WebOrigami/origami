import inline from "../../src/builtins/inline.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("inline", () => {
  it("inlines Origami expressions found in input text, preserving front matter", async () => {
    const graph = new ObjectGraph({
      name: "Alice",
    });
    const text = `Hello, {{name}}!`;
    const inlined = await inline.call(graph, text);
    assert.equal(inlined, "Hello, Alice!");
  });
});
