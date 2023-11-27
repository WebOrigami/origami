import assert from "node:assert";
import { describe, test } from "node:test";
import textDocument2 from "../../src/common/textDocument2.js";

describe("textDocument2", () => {
  test("accepts text and plain data", async () => {
    const text = "Body text";
    const data = { a: 1 };
    const document = textDocument2(text, data);
    assert.deepEqual(document, {
      "@text": text,
      a: 1,
    });
    assert.equal(String(document), text);
  });
});
