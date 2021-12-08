import ExplorableObject from "../../src/core/ExplorableObject.js";
import hbs from "../../src/eg/commands/hbs.js";
import assert from "../assert.js";

describe("hbs (Handlebars) command", () => {
  it("applies a template to data", async () => {
    const template = `Hello, {{name}}.`;
    const data = { name: "world" };
    const result = await hbs(template, data);
    assert.equal(result, "Hello, world.");
  });

  it("applies partials found in scope", async () => {
    const template = `Hello, {{#>bold}}{{name}}{{/bold}}.`;
    const data = { name: "world" };
    const graph = new ExplorableObject({
      "bold.hbs": `<b>{{> @partial-block }}</b>`,
    });
    const result = await hbs.call(graph, template, data);
    assert.equal(result, "Hello, <b>world</b>.");
  });

  it("uses template front matter as data context if no input is given", async () => {
    const template = `---
name: "world"
---
Hello, {{name}}.`;
    const result = await hbs(template);
    assert.equal(result, "Hello, world.");
  });

  it("accommodates front matter in the input object", async () => {
    const template = `<h1>{{title}}</h1>
{{{bodyText}}}`;
    const data = `---
title: Test
---
Hello, <em>world</em>.`;
    const result = await hbs(template, data);
    assert.equal(
      result,
      `<h1>Test</h1>
Hello, <em>world</em>.`
    );
  });
});
