import make from "../../src/builtins/make.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import FormulasTransform from "../../src/framework/FormulasTransform.js";
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
    const virtual = new (FormulasTransform(ObjectGraph))(graph);
    const real = new ObjectGraph(graph);
    await make(virtual, real);
    assert.deepEqual(await ExplorableGraph.plain(real), {
      ".ori.clean.yaml": `b: ""\nmore:\n  c: ""\n`,
      a: "Hello",
      "b = a": "",
      b: "Hello",
      more: {
        "c = 'Goodbye'": "",
        c: "Goodbye",
      },
    });
  });

  it("Considers contents of .ori.clean.yaml to determine which values are real", async () => {
    const graph = {
      ".ori.clean.yaml": `a: ""\n`,
      "a = 'Hello'": "",
      a: "Hi", // make should update this value
      "b = 'Goodbye'": "", // make should create this value
    };
    const virtual = new (FormulasTransform(ObjectGraph))(graph);
    const real = new ObjectGraph(graph);
    await make(virtual, real);
    assert.deepEqual(await ExplorableGraph.plain(real), {
      ".ori.clean.yaml": `a: ""\nb: ""\n`,
      "a = 'Hello'": "",
      a: "Hello",
      "b = 'Goodbye'": "",
      b: "Goodbye",
    });
  });
});
