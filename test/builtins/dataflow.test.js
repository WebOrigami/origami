import dataflow from "../../src/builtins/dataflow.js";
import assert from "../assert.js";

describe.only("dataflow", () => {
  it("runs", async () => {
    const graph = {
      "a = fn(b)": null,
      "a = d": null,
      // builtin map will be ignored, as will ./foo
      "b = map(c, =./foo)": null,
      c: "Hello",
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      a: ["fn", "b", "d"],
      b: ["c"],
      c: [],
      d: [],
      fn: [],
    });
  });
});
