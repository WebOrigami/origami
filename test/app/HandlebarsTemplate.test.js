import HandlebarsTemplate from "../../src/app/HandlebarsTemplate.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("HandlebarsTemplate", () => {
  it("applies a template to data", async () => {
    const template = new HandlebarsTemplate(`Hello, {{name}}.`);
    const data = { name: "world" };
    const result = await template.apply(data);
    assert.equal(result, "Hello, world.");
  });

  it("applies partials found in scope", async () => {
    const graph = new ExplorableObject({
      "bold.hbs": `<b>{{> @partial-block }}</b>`,
    });
    const template = new HandlebarsTemplate(
      `Hello, {{#>bold}}{{name}}{{/bold}}.`,
      graph
    );
    const data = { name: "world" };
    const result = await template.apply(data);
    assert.equal(result, "Hello, <b>world</b>.");
  });

  it("uses template front matter as data context if no input is given", async () => {
    const template = new HandlebarsTemplate(`---
name: "world"
---
Hello, {{name}}.`);
    const result = await template.apply();
    assert.equal(result, "Hello, world.");
  });

  it("accommodates front matter in the input object", async () => {
    const template = new HandlebarsTemplate(`<h1>{{title}}</h1>
  {{{bodyText}}}`);
    const data = `---
title: Test
---
Hello, <em>world</em>.`;
    const result = await template.apply(data);
    assert.equal(
      result,
      `<h1>Test</h1>
  Hello, <em>world</em>.`
    );
  });

  it("layers input data on top of template front matter if present", async () => {
    const template = new HandlebarsTemplate(`---
name: world
message: Hello
---
{{message}}, {{name}}.`);
    const data = {
      name: "Alice",
    };
    const result = await template.apply(data);
    assert.equal(result, `Hello, Alice.`);
  });

  it("makes template's own contents available as data", async () => {
    const template = new HandlebarsTemplate(`---
foo: bar
---
{{{template}}}`);
    const result = await template.apply();
    assert.equal(result, `{{{template}}}`);
  });
});
