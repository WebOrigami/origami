import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import FormulasTransform from "../../src/framework/FormulasTransform.js";
import KeysTransform from "../../src/framework/KeysTransform.js";
import assert from "../assert.js";

class FormulasObject extends FormulasTransform(KeysTransform(ObjectGraph)) {}

describe("FormulasTransform", () => {
  it("iterator includes public keys (which exclude formulas)", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
      more: {
        "c = 'Goodbye'": "",
      },
    });
    assert.deepEqual(await ExplorableGraph.keys(fixture), ["a", "b", "more"]);
    const more = await fixture.get("more");
    assert.deepEqual(await ExplorableGraph.keys(more), ["c"]);
  });

  it("formulas are hidden", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.deepEqual(await fixture.allKeys(), ["a", "a = b", "b"]);
    assert.deepEqual(await fixture.publicKeys(), ["a", "b"]);
    assert.deepEqual(await fixture.realKeys(), ["a = b", "b"]);
  });

  it("can get a value defined by an assignment", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.equal(await fixture.get("a"), "Hello");
  });

  it("first formula that returns a defined value is used", async () => {
    const fixture = new FormulasObject({
      a: undefined,
      "a = b()": "",
      "a = c": "",
      b: () => undefined,
      c: "Hello",
    });
    assert.equal(await fixture.get("a"), "Hello");
  });
});
