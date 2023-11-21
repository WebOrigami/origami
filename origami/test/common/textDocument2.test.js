import { ObjectTree, Tree } from "@graphorigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import textDocument2 from "../../src/common/textDocument2.js";

describe("textDocument2", () => {
  test("accepts text without data", async () => {
    const text = "Body text";
    const document = textDocument2(text);
    assert.equal(String(document), text);
    assert.deepEqual(await Tree.plain(document), {
      "@body": text,
    });
  });

  test("accepts text and plain data", async () => {
    const text = "Body text";
    const data = { a: 1 };
    const document = textDocument2(text, data);
    assert.equal(String(document), text);
    assert.deepEqual(await Tree.plain(document), {
      "@body": text,
      a: 1,
    });
  });

  // test("can be packed to text", async () => {
  //   const text = "Body text";
  //   const data = { a: 1 };
  //   const document = textDocument2(text, data);
  //   assert.equal(await document.pack(), `---\na: 1\n---\n${text}`);
  // });

  test("accepts text with front matter", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document = textDocument2(text);
    assert.deepEqual(await Tree.plain(document), {
      "@body": "Body text",
      a: 1,
    });
    assert.equal(document.toString(), "Body text");
  });

  // test("adds toString to AsyncTree input", async () => {
  //   const tree = new ObjectTree({
  //     a: 1,
  //     "@body": "Body text",
  //   });
  //   const document = textDocument2(tree);
  //   assert.deepEqual(await Tree.plain(document), {
  //     "@body": "Body text",
  //     a: 1,
  //   });
  //   assert.equal(document.toString(), "Body text");
  // });

  test("returns a new copy of AsyncTree input", async () => {
    const text = "---\na: 1\n---\nBody text";
    const document1 = textDocument2(text);
    const document2 = textDocument2(document1);
    assert.notEqual(document2, document1);
    assert.deepEqual(await Tree.plain(document2), await Tree.plain(document1));
  });

  test("front matter can include Origami expressions in scope", async () => {
    const text = `---
message: !ori greeting
---
Body text`;
    const document = textDocument2(text);
    document.parent = new ObjectTree({ greeting: "Hello" });
    assert.deepEqual(await Tree.plain(document), {
      "@body": "Body text",
      message: "Hello",
    });
  });

  test("front matter can be missing", async () => {
    const text = "Body text";
    const document = textDocument2(text);
    assert.deepEqual(await Tree.plain(document), {
      "@body": text,
    });
  });

  // test("from() and pack() use the same format", async () => {
  //   const text = "---\na: 1\n---\nBody text";
  //   const document = textDocument2(text);
  //   assert.equal(await document.pack(), text);
  // });
});
