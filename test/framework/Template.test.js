import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
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

  it("extends scope with input front matter", async () => {
    const template = new Template("");
    const graph = new ObjectGraph({});
    const input = `---
a: 1
---
text`;
    template.compiled = async (scope) => {
      assert.equal(await scope.get("a"), 1);
      return "";
    };
    await template.apply(input, graph);
  });

  it("defines ambient properties for input and template data", async () => {
    const templateScope = {};
    const templateDocument = `---
a: 1
---
template`;
    const template = new Template(templateDocument, templateScope);
    const inputScope = new ObjectGraph({});
    const inputDocument = `---
b: 2
---
text`;
    template.compiled = async (scope) => {
      const templateInfo = await scope.get("@template");
      assert.deepEqual(await ExplorableGraph.plain(templateInfo), {
        scope: templateScope,
        frontData: { a: 1 },
        text: "template",
      });

      const frontData = await scope.get("@frontData");
      assert.deepEqual(await ExplorableGraph.plain(frontData), { b: 2 });
      assert.equal(await scope.get("."), inputDocument);
      assert.equal(await scope.get("@text"), "text");
      return "";
    };
    await template.apply(inputDocument, inputScope);
  });

  it("interprets input and template data as metagraphs", async () => {
    const template = new Template(`---
a = 1:
---
template`);
    const graph = new ObjectGraph({});
    const input = `---
b = 2:
---
text`;
    template.compiled = async (scope) => {
      assert.equal(await scope.get("a"), 1);
      assert.equal(await scope.get("b"), 2);
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
      "message = `{{greeting}}, {{name}}.`": null,
      message: "Hello, Alice.",
    });
  });
});
