import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import TextDocument from "../../src/common/TextDocument.js";

describe("TextDocument", () => {
  test("accepts plain text with no content", async () => {
    const bodyText = "Body text";
    const document = new TextDocument(bodyText);
    assert.equal(String(document), bodyText);
    assert.equal(document.bodyText, bodyText);
    assert.equal(await document.contents(), bodyText);
  });

  test("accepts plain text and accompanying contents", async () => {
    const bodyText = "Body text";
    const contents = {
      a: 1,
    };
    const parent = new ObjectGraph({});
    const document = new TextDocument(bodyText, { contents, parent });
    assert.equal(String(document), bodyText);
    assert.equal(document.bodyText, bodyText);
    assert.deepEqual(await document.contents(), contents);
  });
});
