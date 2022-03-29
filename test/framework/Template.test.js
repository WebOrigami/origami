import { ExplorableGraph } from "../../exports.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import Template from "../../src/framework/Template.js";
import assert from "../assert.js";

describe("Template", () => {
  it("parses template that has no front matter", () => {
    const container = {};
    const template = new Template("text", container);
    assert.equal(template.frontData, null);
    assert.equal(template.text, "text");
    assert.equal(template.container, container);
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
    assert.equal(template.container, container);
  });

  it("extends container scope with template and input data", async () => {
    const template = new Template(`---
b: 2
---
template`);
    const graph = new ExplorableObject({
      a: 1,
    });
    const input = { c: 3 };
    template.compiled = async (context) => {
      // Context itself is the combined input + template data
      assert.deepEqual(await ExplorableGraph.plain(context), {
        b: 2,
        c: 3,
      });
      // Scope is combined input + template + container
      assert.deepEqual(await ExplorableGraph.plain(context.scope), {
        a: 1,
        b: 2,
        c: 3,
      });
      return "";
    };
    await template.apply(input, graph);
  });

  it("extends scope with input front matter", async () => {
    const template = new Template("");
    const graph = new ExplorableObject({});
    const input = `---
a: 1
---
text`;
    template.compiled = async (context) => {
      assert.equal(String(context), "text");
      assert.equal(await context.scope.get("a"), 1);
      return "";
    };
    await template.apply(input, graph);
  });

  it("defines ambient properties for input and template data", async () => {
    const templateContainer = {};
    const templateDocument = `---
a: 1
---
template`;
    const template = new Template(templateDocument, templateContainer);
    const inputContainer = new ExplorableObject({});
    const inputDocument = `---
b: 2
---
text`;
    template.compiled = async (context) => {
      const scope = context.scope;

      const templateInfo = await scope.get("@template");
      assert.deepEqual(templateInfo, {
        container: templateContainer,
        frontData: { a: 1 },
        text: "template",
      });

      assert.equal(await scope.get("@container"), inputContainer);
      assert.deepEqual(await scope.get("@frontData"), { b: 2 });
      assert.equal(await scope.get("@input"), inputDocument);
      assert.equal(await scope.get("@text"), "text");
      return "";
    };
    await template.apply(inputDocument, inputContainer);
  });

  it("interprets input and template data as metagraphs", async () => {
    const template = new Template(`---
a = 1:
---
template`);
    const graph = new ExplorableObject({});
    const input = `---
b = 2:
---
text`;
    template.compiled = async (context) => {
      assert.equal(await context.scope.get("a"), 1);
      assert.equal(await context.scope.get("b"), 2);
      return "";
    };
    await template.apply(input, graph);
  });

  it("along with result, returns a graph of template and input data", async () => {
    const template = new Template(`---
message = \`{{greeting}}, {{name}}.\`:
---
template`);
    const graph = new ExplorableObject({
      greeting: "Hello",
    });
    const input = { name: "Alice" };
    const result = await template.apply(input, graph);
    const resultGraph = result.toGraph();
    assert.deepEqual(await ExplorableGraph.plain(resultGraph), {
      name: "Alice",
      "message = `{{greeting}}, {{name}}.`": null,
      message: "Hello, Alice.",
    });
  });
});
