import assert from "node:assert";
import { describe, test } from "node:test";
import documentObject from "../../src/common/documentObject.js";

describe("documentObject", () => {
  test("converts text and data to document body with _body", async () => {
    const document = await documentObject("Hello world", { title: "Test" });
    assert.deepEqual(document, {
      _body: "Hello world",
      title: "Test",
    });
  });

  test("pack returns front matter and body", async () => {
    const document = await documentObject("Hello world", { title: "Test" });
    const packed = await document.pack();
    assert.strictEqual(packed, `---\ntitle: Test\n---\n\nHello world`);
  });
});
