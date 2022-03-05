import FormulasTransform from "../../src/app/FormulasTransform.js";
import make from "../../src/builtins/make.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("make", () => {
  it("creates the virtual values in a graph", async () => {
    const graph = {
      a: "Hello",
      "b = a": "",
      more: {
        "c = 'Goodbye'": "",
      },
    };
    const virtual = new (FormulasTransform(ExplorableObject))(graph);
    const real = new ExplorableObject(graph);
    await make(virtual, real);
    assert.deepEqual(await ExplorableGraph.plain(real), {
      ".eg.clean.yaml": `b: ""\nmore:\n  c: ""\n`,
      a: "Hello",
      "b = a": "",
      b: "Hello",
      more: {
        "c = 'Goodbye'": "",
        c: "Goodbye",
      },
    });
  });

  it("Considers contents of .eg.clean.yaml to determine which values are real", async () => {
    const graph = {
      ".eg.clean.yaml": `a: ""\n`,
      "a = 'Hello'": "",
      a: "Hi", // make should update this value
      "b = 'Goodbye'": "", // make should create this value
    };
    const virtual = new (FormulasTransform(ExplorableObject))(graph);
    const real = new ExplorableObject(graph);
    await make(virtual, real);
    assert.deepEqual(await ExplorableGraph.plain(real), {
      ".eg.clean.yaml": `a: ""\nb: ""\n`,
      "a = 'Hello'": "",
      a: "Hello",
      "b = 'Goodbye'": "",
      b: "Goodbye",
    });
  });
});