import assert from "node:assert";
import { describe, test } from "node:test";
import fileTypeText from "../../../src/builtins/txt_handler.js";

describe("text handler", () => {
  test("packs an object as YAML with front matter", async () => {
    const object = {
      "@text": "Body text",
      a: 1,
    };
    const packed = await fileTypeText.pack(object);
    assert.equal(packed, "---\na: 1\n---\nBody text");
  });

  test("unpacks text without data", async () => {
    const text = "Body text";
    const result = await fileTypeText.unpack(text);
    assert.equal(result, text);
  });

  test("unpacks a document with YAML/JSON front matter", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document = await fileTypeText.unpack(text);
    assert.deepEqual(document, {
      "@text": "Body text",
      a: 1,
    });
  });
});
