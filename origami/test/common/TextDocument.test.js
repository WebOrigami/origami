import assert from "node:assert";
import { describe, test } from "node:test";
import TextDocument from "../../src/common/TextDocument.js";

describe("TextDocument", () => {
  test("accepts text and plain data", async () => {
    const text = "Body text";
    const data = { a: 1 };
    const document = new TextDocument(text, data);
    assert.deepEqual(document, {
      "@text": text,
      a: 1,
    });
    assert.equal(String(document), text);
  });

  test("constructor and pack() use the same format", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document = new TextDocument(text);
    assert.equal(await document.pack(), text);
  });
});
