import assert from "node:assert";
import { describe, test } from "node:test";
import loadText from "../../src/loaders/txt.js";

describe("text loader", () => {
  test("loads a document with YAML/JSON front matter", async () => {
    const text = `---
a: 1
---
text`;
    const document = await loadText(null, text);
    assert.equal(String(document), text);
    const data = await document.contents();
    assert.deepEqual(data, { a: 1 });
  });
});
