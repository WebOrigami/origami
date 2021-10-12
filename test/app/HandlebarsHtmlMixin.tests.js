import { ExplorableGraph } from "../../exports.js";
import HandlebarsHtmlMixin from "../../src/app/HandlebarsHtmlMixin.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

class ObjectWithHandlebars extends HandlebarsHtmlMixin(ExplorableObject) {}

describe("HandlebarsHtmlMixin", () => {
  it("generates a file from a .handlebars file with front matter", async () => {
    const graph = new ObjectWithHandlebars({
      "hello.txt.hbs": `---
name: world
---
Hello, {{name}}.`,
    });
    const keys = await ExplorableGraph.keys(graph);
    assert.deepEqual(keys, ["hello.txt.hbs", "hello.txt"]);
    const html = await graph.get("hello.txt");
    assert.equal(html, "Hello, world.");
  });

  it("generates a file from a .hbs and .json file", async () => {
    const graph = new ObjectWithHandlebars({
      "foo.html.hbs": `Hello, {{name}}.`,
      "foo.json": `{ "name": "world" }`,
    });
    const html = await graph.get("foo.html");
    assert.equal(html, "Hello, world.");
  });

  it("generates a file from a .hbs and .yaml file", async () => {
    const graph = new ObjectWithHandlebars({
      "foo.html.hbs": `Hello, {{name}}.`,
      "foo.yaml": `{ "name": "world" }`,
    });
    const html = await graph.get("foo.html");
    assert.equal(html, "Hello, world.");
  });
});
