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

  it("applies partials found in the local graph", async () => {
    const template = `Hello, {{#>bold}}{{name}}{{/bold}}.`;
    const data = { name: "world" };
    const graph = new ExplorableObject({
      "bold.hbs": `<b>{{> @partial-block }}</b>`,
    });
    const environment = { graph };
    const result = await hbs.call(environment, template, data);
    assert.equal(result, "Hello, <b>world</b>.");
  });
});
