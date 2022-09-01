import make from "../../src/builtins/make.js";
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
    await make(graph);
    assert.deepEqual(graph, {
      ".ori.clean.yaml": `b: null\nmore:\n  c: null\n`,
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
      ".ori.clean.yaml": `a: null\n`,
      "a = 'Hello'": "",
      a: "Hi", // make should update this value
      "b = 'Goodbye'": "", // make should create this value
    };
    await make(graph);
    assert.deepEqual(graph, {
      ".ori.clean.yaml": `a: null\nb: null\n`,
      "a = 'Hello'": "",
      a: "Hello",
      "b = 'Goodbye'": "",
      b: "Goodbye",
    });
  });
});
