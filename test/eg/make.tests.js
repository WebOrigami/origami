import { ExplorableGraph, ExplorableObject } from "../../exports.js";
import FormulasMixin from "../../src/app/FormulasMixin.js";
import make from "../../src/eg/commands/make.js";
import assert from "../assert.js";

describe("make", () => {
  it("creates the virtual values in a graph", async () => {
    const graph = {
      a: "Hello",
      "b = a": "",
    };
    const virtual = new (FormulasMixin(ExplorableObject))(graph);
    const real = new ExplorableObject(graph);
    await make(virtual, real);
    assert.deepEqual(await ExplorableGraph.plain(real), {
      ".eg.clean.yaml": `b: ""\n`,
      a: "Hello",
      "b = a": "",
      b: "Hello",
    });
  });
});
