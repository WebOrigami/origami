import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import MetaTransform from "../../src/framework/MetaTransform.js";
import Template from "../../src/framework/Template.js";
import assert from "../assert.js";

describe("Template", () => {
  it("parses template that has no front matter", () => {
    const container = {};
    const template = new Template("text", container);
    assert.equal(template.frontData, null);
    assert.equal(template.text, "text");
    assert.equal(template.scope, container);
  });

  it("parses template with front matter", () => {
    const container = {};
    const template = new Template(
      `---
a: 1
---
text`,
      container
    );
    assert.deepEqual(template.frontData, { a: 1 });
    assert.equal(template.text, "text");
    assert.equal(template.scope, container);
  });

  it("extends scope with input data", async () => {
    const template = new Template("");
    const scope = new ObjectGraph({});
    const input = { a: 1 };
    template.compiled = async (scope) => {
      assert.equal(await scope.get("a"), 1);
      return "";
    };
    await template.apply(input, scope);
  });

  it("extends container scope with template and input data", async () => {
    const template = new Template(`---
b: 2
---
template`);
    const scope = new ObjectGraph({
      a: 1,
    });
    const input = { c: 3 };
    template.compiled = async (scope) => {
      // Scope includes input + template + container
      assert.equal(await scope.get("a"), 1);
      assert.equal(await scope.get("b"), 2);
      assert.equal(await scope.get("c"), 3);
      return "";
    };
    await template.apply(input, scope);
  });

  it("defines ambient properties for input and template data", async () => {
    const templateScope = {};
    const templateDocument = `---
a: 1
---
template`;
    const template = new Template(templateDocument, templateScope);
    const inputScope = new ObjectGraph({});
    const input = {
      b: 2,
    };
    template.compiled = async (scope) => {
      const templateInfo = await scope.get("@template");
      assert.deepEqual(await ExplorableGraph.plain(templateInfo), {
        scope: templateScope,
        frontData: { a: 1 },
        text: "template",
      });

      const dot = await scope.get(".");
      assert.deepEqual(await ExplorableGraph.plain(dot), { b: 2 });
      assert.equal(await scope.get("@text"), "[object Object]");
      return "";
    };
    await template.apply(input, inputScope);
  });

  it("input and template data graphs are merged", async () => {
    const template = new Template(`---
a: 1
b2 = b:
---
template`);
    const graph = new ObjectGraph({});
    const input = new (MetaTransform(ObjectGraph))({
      b: 2,
      "a2 = a": null,
    });
    template.compiled = async (scope) => {
      assert.equal(await scope.get("b2"), 2);
      assert.equal(await scope.get("a2"), 1);
      return "";
    };
    await template.apply(input, graph);
  });

  it("along with result, returns a graph of template and input data", async () => {
    const template = new Template(`---
message = \`{{greeting}}, {{name}}.\`:
---
template`);
    const graph = new ObjectGraph({
      greeting: "Hello",
    });
    const input = { name: "Alice" };
    const result = await template.apply(input, graph);
    const resultGraph = result.toGraph();
    assert.deepEqual(await ExplorableGraph.plain(resultGraph), {
      name: "Alice",
      message: "Hello, Alice.",
    });
  });
});
