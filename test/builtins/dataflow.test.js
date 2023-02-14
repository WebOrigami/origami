import dataflow from "../../src/builtins/dataflow.js";
import ExpressionGraph from "../../src/common/ExpressionGraph.js";
import InheritScopeTransform from "../../src/framework/InheritScopeTransform.js";
import OrigamiTemplate from "../../src/framework/OrigamiTemplate.js";
import { createExpressionFunction } from "../../src/language/expressionFunction.js";
import * as ops from "../../src/language/ops.js";
import loadGraph from "../../src/loaders/graph.js";
import loadYaml from "../../src/loaders/yaml.js";
import assert from "../assert.js";

describe("dataflow", () => {
  it("identifies dependencies in expressions", async () => {
    const textWithGraph = loadYaml(`
      a: !ori fn(b)
      # builtin map will be ignored, as will ./foo
      b: !ori map(c, =./foo)
      c: Hello
    `);
    const graph = textWithGraph.toGraph();
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      a: {
        dependencies: ["fn", "b"],
      },
      b: {
        dependencies: ["c"],
      },
      c: {},
      fn: {
        undefined: true,
      },
    });
  });

  it("ignore @ ambients", async () => {
    const textWithGraph = loadYaml(`
      foo: !ori (@bar)
    `);
    const graph = textWithGraph.toGraph();
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      foo: {
        dependencies: [],
      },
    });
  });

  it("if all dependencies are builtins, uses source expression as dependency", async () => {
    const textWithGraph = loadYaml(`
      foo: !ori mdHtml()
    `);
    const graph = textWithGraph.toGraph();
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      foo: {
        dependencies: [],
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
      "index.ori": new OrigamiTemplate(`{{ map(foo, bar) }}`),
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

  it("identified dependencies in scope", async () => {
    const graph = new (InheritScopeTransform(ExpressionGraph))({
      a: createExpressionFunction([ops.scope, "b"]),
    });
    graph.parent = new ExpressionGraph({
      b: createExpressionFunction([ops.scope, "c"]),
      c: null,
    });
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      a: {
        dependencies: ["b"],
      },
      b: {
        dependencies: ["c"],
      },
      c: {},
    });
  });

  it("identifies dependencies in .graph files", async () => {
    const graph = {
      "foo.graph": loadGraph(`a = b`),
    };
    const flow = await dataflow(graph);
    assert.deepEqual(flow, {
      "foo.graph": {
        dependencies: ["b"],
      },
      b: {
        undefined: true,
      },
    });
  });

  it("starts with dependencies in .dataflow.yaml value", async () => {
    const graph = new ExpressionGraph({
      ".dataflow.yaml": `
a:
  dependencies:
    - b
b: {}
`,
      a: createExpressionFunction([ops.scope, "c"]),
    });
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
    const graph = new ExpressionGraph({
      a: createExpressionFunction([ops.scope, "b"]),
    });
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
    const graph = new ExpressionGraph({
      x: createExpressionFunction([[ops.scope, "fn"]]),
      "fn.js": null,
    });
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
