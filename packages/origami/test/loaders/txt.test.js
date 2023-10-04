import assert from "node:assert";
import { describe, test } from "node:test";
import unpackText from "../../src/loaders/txt.js";

describe("text loader", () => {
  test("unpacks a document with YAML/JSON front matter", async () => {
    const text = `---
a: 1
---
Body text`;
    const document = await unpackText(text);
    assert.equal(String(document), "Body text");
    assert.deepEqual(document.data, { a: 1 });
    assert.deepEqual(await document.unpack(), { a: 1 });
  });
});
