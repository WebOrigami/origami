import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import { jsedocumentHandler } from "../../src/handlers/handlers.js";

describe("JSE document handler", () => {
  test("unpacks text with JSE expressions", async () => {
    const parent = new ObjectTree({
      name: "world",
    });
    const text = "Hello, ${ <name> }!";
    const fn = await jsedocumentHandler.unpack(text, {
      key: "test.jse.txt",
      parent,
    });
    const result = await fn();
    assert.equal(result, "Hello, world!");

    // Test sidecar keyFn
    assert.equal(fn.key("data.json"), "data.txt");
  });

  test("Argument to template document available as underscore", async () => {
    const text = "<h1>${ _ }</h1>";
    const fn = await jsedocumentHandler.unpack(text);
    const result = await fn("Home");
    assert.equal(result, "<h1>Home</h1>");
  });

  test("YAML front matter is returned as _body", async () => {
    const parent = new ObjectTree({
      message: "Hello",
    });
    const text = `---
name: world
---
\${ <message> }, \${ name }!`;
    const result = await jsedocumentHandler.unpack(text, { parent });
    assert.deepEqual(result.name, "world");
    assert.equal(result._body, "Hello, world!");
  });

  test("JSE front matter can refer to template() as a macro", async () => {
    const text = `---
(name) => _template()
---
Hello, \${ name }!
`;
    const fn = await jsedocumentHandler.unpack(text);
    const result = await fn("world");
    assert.equal(result, "Hello, world!\n");
  });

  test("unpacks a document with JSE front matter", async () => {
    const text = `---
{
  sum: 1 + 1,
  _body: _template()
}
---
Body text`;
    const result = await jsedocumentHandler.unpack(text);
    assert.deepEqual(result, {
      sum: 2,
      _body: "Body text",
    });
  });
});
