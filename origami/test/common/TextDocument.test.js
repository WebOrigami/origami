import { ObjectTree, Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import TextDocument from "../../src/common/TextDocument.js";

describe("TextDocument", () => {
  test("holds text without data", async () => {
    const text = "Body text";
    const document = new TextDocument(text);
    assert.equal(String(document), text);
    assert.equal(document.text, text);
    assert.equal(document.data, undefined);
    assert.equal(await document.unpack(), undefined);
  });

  test("holds text and data", async () => {
    const text = "Body text";
    const data = { a: 1 };
    const document = new TextDocument(text, data);
    assert.equal(String(document), text);
    assert.equal(document.text, text);
    assert.equal(document.data, data);
    assert.equal(await document.unpack(), data);
  });

  test("can be packed to text", async () => {
    const text = "Body text";
    const data = { a: 1 };
    const document = new TextDocument(text, data);
    assert.equal(await document.pack(), `---\na: 1\n---\n${text}`);
  });

  test("from() returns a new copy of a TextDocument input", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document1 = TextDocument.from(text);
    const document2 = TextDocument.from(document1);
    assert.notEqual(document2, document1);
    assert.equal(document2.text, document1.text);
    assert.equal(document2.data, document1.data);
  });

  test("front matter can include Origami expressions in scope", async () => {
    const text = `---
message: !ori greeting
---
`;
    const document = TextDocument.from(text);
    document.parent = new ObjectTree({ greeting: "Hello" });
    assert.deepEqual(await Tree.plain(document.data), { message: "Hello" });
  });

  test("from() and pack() use the same format", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document = TextDocument.from(text);
    assert.equal(await document.pack(), text);
  });
});
