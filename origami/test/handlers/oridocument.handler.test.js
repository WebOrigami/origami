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
    const fn = await oridocumentHandler.unpack(text, { parent });
    const result = await fn();
    assert.equal(result, "Hello, world!");
  });

  test("YAML front matter is returned with @text", async () => {
    const text = `---
name: world
---
Hello, \${ name }!`;
    const fn = await oridocumentHandler.unpack(text);
    const result = await fn();
    assert.deepEqual(result.name, "world");
    assert.equal(result["@text"], "Hello, world!");
  });

  test("unpacks a document with Origami front matter", async () => {
    const text = `---
{ sum: 1 + 1 }
---
Body text`;
    const fn = await oridocumentHandler.unpack(text);
    const result = await fn();
    assert.deepEqual(result, {
      sum: 2,
      "@text": "Body text",
    });
  });
});
