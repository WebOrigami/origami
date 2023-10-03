import assert from "node:assert";
import { describe, test } from "node:test";
import TextDocument2 from "../../src/common/TextDocument2.js";

describe("TextDocument2", () => {
  test("holds text without data", async () => {
    const text = "Body text";
    const document = new TextDocument2(text);
    assert.equal(String(document), text);
    assert.equal(document.text, text);
    assert.equal(document.data, undefined);
    assert.equal(await document.contents(), text);
  });

  test("holds text and data", async () => {
    const text = "Body text";
    const data = { a: 1 };
    const document = new TextDocument2(text, data);
    assert.equal(String(document), text);
    assert.equal(document.text, text);
    assert.equal(document.data, data);
    assert.equal(await document.contents(), data);
  });

  test("can be serialized to text", async () => {
    const text = "Body text";
    const data = { a: 1 };
    const document = new TextDocument2(text, data);
    assert.equal(await document.serialize(), `---\na: 1\n---\n${text}`);
  });

  test("serializes and deserializes in same format", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document = TextDocument2.from(text);
    assert.equal(await document.serialize(), text);
  });

  test("attempting to deserialize a document object returns a new copy", async () => {});
});
