import assert from "node:assert";
import { describe, test } from "node:test";
import dataflow from "../../../src/builtins/@tree/dataflow.js";
import ExpressionTree from "../../../src/common/ExpressionTree.js";
import TextDocument from "../../../src/common/TextDocument.js";
import InheritScopeTransform from "../../../src/framework/InheritScopeTransform.js";
import { createExpressionFunction } from "../../../src/language/expressionFunction.js";
import * as ops from "../../../src/language/ops.js";
import unpackOrigamiExpression from "../../../src/loaders/ori.js";
import unpackOrigamiTemplate from "../../../src/loaders/orit.js";
import unpackYaml from "../../../src/loaders/yaml.js";

describe("@tree/dataflow", () => {
  test("identifies dependencies in expressions", async () => {
    const tree = unpackYaml(`
a: !ori fn(b)
# builtin map will be ignored, as will ./foo
b: !ori (@tree/map(c, =./foo))
c: Hello
    `);
    const flow = await dataflow.call(null, tree);
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
    const tree = unpackYaml(`foo: !ori (@bar)`);
    const flow = await dataflow.call(null, tree);
    assert.deepEqual(flow, {
      foo: {
        dependencies: [],
      },
    });
  });

  test("if all dependencies are builtins, uses source expression as dependency", async () => {
    const tree = unpackYaml(`foo: !ori (@mdHtml())`);
    const flow = await dataflow.call(null, tree);
    assert.deepEqual(flow, {
      foo: {
        dependencies: [],
      },
    });
  });

  test("identifies dependencies in HTML img tags", async () => {
    const tree = {
      "foo.html": `<html><body><img src="images/a.jpg"></body></html>`,
      images: {},
    };
    const flow = await dataflow.call(null, tree);
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
    const tree = {
      // Since bar isn't defined in tree, it will be assumed to be a value
      // supplied to the template, and so will not be returned as part of the
      // tree's dataflow.
      "index.orit": templateDocument,
      foo: {},
    };
    const flow = await dataflow.call(null, tree);
    assert.deepEqual(flow, {
      "index.orit": {
        dependencies: ["foo"],
      },
      foo: {},
    });
  });

  test("identified dependencies in scope", async () => {
    const tree = new (InheritScopeTransform(ExpressionTree))({
      a: createExpressionFunction([ops.scope, "b"]),
    });
    tree.parent2 = new ExpressionTree({
      b: createExpressionFunction([ops.scope, "c"]),
      c: null,
    });
    const flow = await dataflow.call(null, tree);
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
    const tree = {
      "foo.ori": origamiDocument,
    };
    const flow = await dataflow.call(null, tree);
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
    const tree = new ExpressionTree({
      ".dataflow.yaml": `
a:
  dependencies:
    - b
b: {}
`,
      a: createExpressionFunction([ops.scope, "c"]),
    });
    const flow = await dataflow.call(null, tree);
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
    const tree = new ExpressionTree({
      a: createExpressionFunction([ops.scope, "b"]),
    });
    const flow = await dataflow.call(null, tree);
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
    const tree = new ExpressionTree({
      x: createExpressionFunction([[ops.scope, "fn"]]),
      "fn.js": null,
    });
    const flow = await dataflow.call(null, tree);
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
