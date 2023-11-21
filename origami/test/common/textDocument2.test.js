import { ObjectTree, Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import { bodyWithData, from } from "../../src/common/textDocument2.js";

describe("textDocument2", () => {
  test("bodyWithData() accepts text and plain data", async () => {
    const text = "Body text";
    const data = { a: 1 };
    const document = bodyWithData(text, data);
    assert.equal(String(document), text);
    assert.deepEqual(await Tree.plain(document), {
      "@body": text,
      a: 1,
    });
  });

  test("from() accepts text without data", async () => {
    const text = "Body text";
    const document = from(text);
    assert.equal(String(document), text);
    assert.deepEqual(await Tree.plain(document), {
      "@body": text,
    });
  });

  test("from() accepts text with front matter", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document = from(text);
    assert.deepEqual(await Tree.plain(document), {
      "@body": "Body text",
      a: 1,
    });
    assert.equal(document.toString(), "Body text");
  });

  test("from() returns a new copy of AsyncTree input", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document1 = from(text);
    const document2 = from(document1);
    assert.notEqual(document2, document1);
    assert.deepEqual(await Tree.plain(document2), await Tree.plain(document1));
  });

  test("from() accepts front matter with Origami expressions", async () => {
    const text = `---
message: !ori greeting
---
Body text`;
    const document = from(text);
    document.parent = new ObjectTree({ greeting: "Hello" });
    assert.deepEqual(await Tree.plain(document), {
      "@body": "Body text",
      message: "Hello",
    });
  });

  test("front matter can be missing", async () => {
    const text = "Body text";
    const document = from(text);
    assert.deepEqual(await Tree.plain(document), {
      "@body": text,
    });
  });
});
