import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/builtins/@inline.js";
import TextDocument2 from "../../src/common/TextDocument2.js";

describe("inline", () => {
  test("inlines Origami expressions found in input text", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `Hello, {{name}}!`;
    const inlinedDocument = await inline.call(scope, text);
    assert.equal(String(inlinedDocument), "Hello, Alice!");
    assert.equal(inlinedDocument.text, "Hello, Alice!");
  });

  test("can reference keys in an attached graph", async () => {
    const document = TextDocument2.deserialize(`---
name: Bob
---
Hello, {{ @attached/name }}!`);
    /** @type {any} */
    const inlinedDocument = await inline.call(null, document);
    assert.equal(inlinedDocument.text, `Hello, Bob!`);
    assert.deepEqual(inlinedDocument.data, { name: "Bob" });
  });
});
