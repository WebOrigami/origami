import hbs from "../../src/cli/builtins/hbs.js";
import assert from "../assert.js";

describe("hbs (Handlebars) command", () => {
  it("applies a template to data", async () => {
    const template = `Hello, {{name}}.`;
    const data = { name: "world" };
    const result = await hbs(template, data);
    assert.equal(result, "Hello, world.");
  });
});
