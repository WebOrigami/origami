import FormulasObject from "../../src/app/FormulasObject.js";
import assert from "../assert.js";

describe("FormulasObject", () => {
  it("can apply formulas defined in keys", async () => {
    const graph = new FormulasObject({
      "a = b": null,
      b: "Hello, world.",
    });
    assert.equal(await graph.get("a"), "Hello, world.");
  });
});
