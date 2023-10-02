import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import FrontMatterDocument from "../../src/common/FrontMatterDocument.js";
import TextDocument from "../../src/common/TextDocument.js";

describe("FrontMatterDocument", () => {
  test("accepts plain text with no front matter", async () => {
    const bodyText = "Body text";
    const document = new FrontMatterDocument(bodyText);
    assert.equal(String(document), bodyText);
    assert.equal(document.bodyText, bodyText);
    assert.equal(document.frontData, null);
    assert.equal(await document.contents(), bodyText);
  });

  test("accepts plain text and accompanying front data", async () => {
    const bodyText = "Body text";
    const frontData = {
      a: 1,
    };
    const document = new FrontMatterDocument(bodyText, { frontData });
    assert.equal(document.bodyText, bodyText);
    assert.equal(document.frontData, frontData);
    assert.equal(document.toString(), `---\na: 1\n---\n${bodyText}`);
  });

  test("detects and parses front matter as YAML", async () => {
    const text = `---
title: My first post
---
This is my first post.`;
    const document = new FrontMatterDocument(text);
    assert.equal(String(document), text);
    assert.equal(document.bodyText, "This is my first post.");
    assert.deepEqual(document.frontData, { title: "My first post" });
    const data = await document.contents();
    assert.deepEqual(data, { title: "My first post" });
  });

  test("front matter can include Origami expressions in scope", async () => {
    const text = `---
message: !ori greeting
---
`;
    const parent = new ObjectGraph({ greeting: "Hello" });
    const document = new FrontMatterDocument(text, { parent });
    const graph = await document.contents();
    assert.deepEqual(await Graph.plain(graph), { message: "Hello" });
  });

  test("can convert a general TextDocument to a FrontMatterDocument", async () => {
    const bodyText = "Body text";
    const contents = {
      a: 1,
    };
    const parent = new ObjectGraph({});
    const textDocument = new TextDocument(bodyText, { contents, parent });
    const frontMatterDocument = await FrontMatterDocument.fromTextDocument(
      textDocument
    );
    assert.equal(String(frontMatterDocument), `---\na: 1\n---\nBody text`);
    assert.equal(frontMatterDocument.bodyText, bodyText);
    assert.deepEqual(frontMatterDocument.frontData, { a: 1 });
  });
});
