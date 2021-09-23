import HandlebarsHtmlMixin from "../../src/app/HandlebarsHtmlMixin.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

class ObjectWithHandlebars extends HandlebarsHtmlMixin(ExplorableObject) {}

describe("HandlebarsHtmlMixin", () => {
  it("generates a .html file from a .handlebars and .json file", async () => {
    const fixture = new ObjectWithHandlebars({
      "foo.handlebars": `Hello, {{name}}.`,
      "foo.json": `{ "name": "world" }`,
    });
    const html = await fixture.get("foo.html");
    assert.equal(html, "Hello, world.");
  });
});
