import dataflow from "../../src/builtins/dataflow.js";
import assert from "../assert.js";

describe("dataflow", () => {
  it("identifies dependencies in formulas", async () => {
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
      d: {
        undefined: true,
      },
      fn: {
        undefined: true,
      },
    });
  });

  it("treats @ graph properties as builtins", async () => {
    const graph = {
      "foo = @bar": null,
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      foo: {
        dependencies: ["foo = @bar"],
      },
      "foo = @bar": {
        label: "@bar",
      },
    });
  });

  it("if all dependencies are builtins, uses source expression as depenendcy", async () => {
    const graph = {
      "foo = mdHtml(this).md": "# Hello",
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      foo: {
        dependencies: ["foo = mdHtml(this).md"],
      },
      "foo = mdHtml(this).md": {
        label: "mdHtml(this).md",
      },
    });
  });

  it("identifies dependencies in HTML img tags", async () => {
    const graph = {
      "foo.html": `<html><body><img src="images/a.jpg"></body></html>`,
      images: {},
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      "foo.html": {
        dependencies: ["images"],
      },
      images: {},
    });
  });

  it("identifies referenced dependencies in Origami templates", async () => {
    const graph = {
      // Since bar isn't defined in graph, it will be assumed to be a value
      // supplied to the template, and so will not be returned as part of the
      // graph's dataflow.
      "index.ori": `{{ map(foo, bar) }}`,
      foo: {},
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      "index.ori": {
        dependencies: ["foo"],
      },
      foo: {},
    });
  });

  it.skip("identifies dependencies in .meta files", async () => {
    const graph = {
      "foo.meta": `a = b: null`,
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      a: {
        dependencies: ["b"],
      },
      b: {},
      "foo.meta": {
        dependencies: [],
      },
    });
  });

  it("starts with dependencies in .dataflow.yaml value", async () => {
    const graph = {
      ".dataflow.yaml": `
a:
  dependencies:
    - b
b: {}
`,
      "a = c": null,
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      a: {
        dependencies: ["b", "c"],
      },
      b: {},
      c: {
        undefined: true,
      },
    });
  });

  it("notes if a dependency is undefined", async () => {
    const graph = {
      "a = b": null,
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      a: {
        dependencies: ["b"],
      },
      b: {
        undefined: true,
      },
    });
  });

  it("creates implicit dependencies for .js files", async () => {
    const graph = {
      "x = fn()": null,
      "fn.js": null,
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      x: {
        dependencies: ["fn"],
      },
      fn: {
        dependencies: ["fn.js"],
      },
      "fn.js": {},
    });
  });
});
