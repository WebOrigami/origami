import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/builtins/@inline.js";
import FrontMatterDocument from "../../src/common/FrontMatterDocument.js";

describe("inline", () => {
  test("inlines Origami expressions found in input text", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `Hello, {{name}}!`;
    const inlinedDocument = await inline.call(scope, text);
    assert.equal(String(inlinedDocument), "Hello, Alice!");
    assert.equal(inlinedDocument.bodyText, "Hello, Alice!");
  });

  test("can reference keys in an attached graph", async () => {
    const document = new FrontMatterDocument(`---
name: Bob
---
Hello, {{ @attached/name }}!`);
    const inlinedDocument = await inline.call(null, document);
    assert.equal(inlinedDocument.bodyText, `Hello, Bob!`);
    const data = await inlinedDocument.contents();
    assert.deepEqual(data, {
      name: "Bob",
    });
  });
});
