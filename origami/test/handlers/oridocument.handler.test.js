import { ObjectTree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import { oridocumentHandler } from "../../src/internal.js";

describe("Origami document handler", () => {
  test("unpacks text with Origami expressions", async () => {
    const parent = new ObjectTree({
      name: "world",
    });
    const text = "Hello, ${ name }!";
    const fn = await oridocumentHandler.unpack(text, {
      key: "test.ori.txt",
      parent,
    });
    const result = await fn();
    assert.equal(result, "Hello, world!");

    // Test sidecar keyFn
    assert.equal(fn.key("data.json"), "data.txt");
  });

  test("Argument to template document available as underscore", async () => {
    const text = "<h1>${ _ }</h1>";
    const fn = await oridocumentHandler.unpack(text);
    const result = await fn("Home");
    assert.equal(result, "<h1>Home</h1>");
  });

  test("YAML front matter is returned with @text", async () => {
    const parent = new ObjectTree({
      message: "Hello",
    });
    const text = `---
name: world
---
\${ message }, \${ name }!`;
    const result = await oridocumentHandler.unpack(text, { parent });
    assert.deepEqual(result.name, "world");
    assert.equal(result["@text"], "Hello, world!");
  });

  test("unpacks a document with Origami front matter", async () => {
    const text = `---
{
  sum: 1 + 1
  @text: @template()
}
---
Body text`;
    const result = await oridocumentHandler.unpack(text);
    assert.deepEqual(result, {
      sum: 2,
      "@text": "Body text",
    });
  });

  test("Origami front matter can refer to @template as a macro", async () => {
    const text = `---
(name) => @template()
---
Hello, \${ name }!
`;
    const fn = await oridocumentHandler.unpack(text);
    const result = await fn("world");
    assert.equal(result, "Hello, world!\n");
  });
});
