import assert from "node:assert";
import { describe, test } from "node:test";
import dataflow from "../../../src/builtins/@graph/dataflow.js";
import ExpressionGraph from "../../../src/common/ExpressionGraph.js";
import TextDocument from "../../../src/common/TextDocument.js";
import InheritScopeTransform from "../../../src/framework/InheritScopeTransform.js";
import { createExpressionFunction } from "../../../src/language/expressionFunction.js";
import * as ops from "../../../src/language/ops.js";
import unpackOrigamiExpression from "../../../src/loaders/ori.js";
import unpackOrigamiTemplate from "../../../src/loaders/orit.js";
import unpackYaml from "../../../src/loaders/yaml.js";

describe("@graph/dataflow", () => {
  test("identifies dependencies in expressions", async () => {
    const graph = unpackYaml(`
a: !ori fn(b)
# builtin map will be ignored, as will ./foo
b: !ori (@graph/map(c, =./foo))
c: Hello
    `);
    const flow = await dataflow.call(null, graph);
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

  test("ignore @ ambients", async () => {
    const graph = unpackYaml(`foo: !ori (@bar)`);
    const flow = await dataflow.call(null, graph);
    assert.deepEqual(flow, {
      foo: {
        dependencies: [],
      },
    });
  });

  test("if all dependencies are builtins, uses source expression as dependency", async () => {
    const graph = unpackYaml(`foo: !ori (@mdHtml())`);
    const flow = await dataflow.call(null, graph);
    assert.deepEqual(flow, {
      foo: {
        dependencies: [],
      },
    });
  });

  test("identifies dependencies in HTML img tags", async () => {
    const graph = {
      "foo.html": `<html><body><img src="images/a.jpg"></body></html>`,
      images: {},
    };
    const flow = await dataflow.call(null, graph);
    assert.deepEqual(flow, {
      "foo.html": {
        dependencies: ["images"],
      },
      images: {},
    });
  });

  test("identifies referenced dependencies in .orit template files", async () => {
    const templateDocument = new TextDocument(`{{ @builtin(foo, bar) }}`);
    templateDocument.unpack = () => unpackOrigamiTemplate(templateDocument);
    const graph = {
      // Since bar isn't defined in graph, it will be assumed to be a value
      // supplied to the template, and so will not be returned as part of the
      // graph's dataflow.
      "index.orit": templateDocument,
      foo: {},
    };
    const flow = await dataflow.call(null, graph);
    assert.deepEqual(flow, {
      "index.orit": {
        dependencies: ["foo"],
      },
      foo: {},
    });
  });

  test("identified dependencies in scope", async () => {
    const graph = new (InheritScopeTransform(ExpressionGraph))({
      a: createExpressionFunction([ops.scope, "b"]),
    });
    graph.parent = new ExpressionGraph({
      b: createExpressionFunction([ops.scope, "c"]),
      c: null,
    });
    const flow = await dataflow.call(null, graph);
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

  test("identifies dependencies in .ori expression files", async () => {
    const origamiDocument = new TextDocument(`{ a = b }`);
    origamiDocument.unpack = () => unpackOrigamiExpression(origamiDocument);
    const graph = {
      "foo.ori": origamiDocument,
    };
    const flow = await dataflow.call(null, graph);
    assert.deepEqual(flow, {
      "foo.ori": {
        dependencies: ["b"],
      },
      b: {
        undefined: true,
      },
    });
  });

  test("starts with dependencies in .dataflow.yaml value", async () => {
    const graph = new ExpressionGraph({
      ".dataflow.yaml": `
a:
  dependencies:
    - b
b: {}
`,
      a: createExpressionFunction([ops.scope, "c"]),
    });
    const flow = await dataflow.call(null, graph);
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

  test("notes if a dependency is undefined", async () => {
    const graph = new ExpressionGraph({
      a: createExpressionFunction([ops.scope, "b"]),
    });
    const flow = await dataflow.call(null, graph);
    assert.deepEqual(flow, {
      a: {
        dependencies: ["b"],
      },
      b: {
        undefined: true,
      },
    });
  });

  test("creates implicit dependencies for .js files", async () => {
    const graph = new ExpressionGraph({
      x: createExpressionFunction([[ops.scope, "fn"]]),
      "fn.js": null,
    });
    const flow = await dataflow.call(null, graph);
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
