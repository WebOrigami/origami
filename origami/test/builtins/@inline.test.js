import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/builtins/@inline.js";
import TextDocument from "../../src/common/TextDocument.js";

describe("inline", () => {
  test("inlines Origami expressions found in input text", async () => {
    const parent = new ObjectGraph({
      name: "Alice",
    });
    const document = new TextDocument(`Hello, {{ name }}!`, null, parent);
    const inlinedDocument = await inline.call(null, document);
    assert.equal(String(inlinedDocument), "Hello, Alice!");
    assert.equal(inlinedDocument.text, "Hello, Alice!");
  });

  test("can reference keys in an attached graph", async () => {
    const document = TextDocument.from(`---
name: Bob
---
Hello, {{ name }}!`);
    /** @type {any} */
    const inlinedDocument = await inline.call(null, document);
    assert.equal(inlinedDocument.text, `Hello, Bob!`);
    assert.deepEqual(inlinedDocument.data, { name: "Bob" });
  });
});
