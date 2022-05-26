import dataflow from "../../src/builtins/dataflow.js";
import assert from "../assert.js";

describe.only("dataflow", () => {
  it("identifies dependencies", async () => {
    const graph = {
      "a = fn(b)": null,
      "a = d": null,
      // builtin map will be ignored, as will ./foo
      "b = map(c, =./foo)": null,
      c: "Hello",
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      a: {
        dependencies: ["fn", "b", "d"],
      },
      b: {
        dependencies: ["c"],
      },
      c: {},
      d: {},
      fn: {},
    });
  });

  it("if all dependencies are builtins, uses source expression as depenendcy", async () => {
    const graph = {
      "foo.html = mdHtml(this).md": "# Hello",
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      "foo.html": {
        dependencies: ["foo.html = mdHtml(this).md"],
      },
      "foo.html = mdHtml(this).md": {
        label: "mdHtml(this).md",
      },
    });
  });
});
