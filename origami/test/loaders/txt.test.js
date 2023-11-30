import { ObjectTree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import unpackText from "../../src/builtins/@loaders/txt.js";

describe("text loader", () => {
  test("unpacks text without data", async () => {
    const text = "Body text";
    const document = await unpackText(text);
    assert.deepEqual(document, {
      "@text": text,
    });
  });

  test("unpacks a document with YAML/JSON front matter", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document = await unpackText(text);
    assert.deepEqual(document, {
      "@text": "Body text",
      a: 1,
    });
  });

  test("unpacks front matter with Origami expressions", async () => {
    const text = `---
message: !ori greeting
---
Body text`;
    const parent = new ObjectTree({
      greeting: "Hello",
    });
    const document = await unpackText(text, { parent });
    assert.deepEqual(document, {
      "@text": "Body text",
      message: "Hello",
    });
  });

  test("unpacks and packs in the same format", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document = await unpackText(text);
    assert.equal(await document.pack(), text);
  });
});
