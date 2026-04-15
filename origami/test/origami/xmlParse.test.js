import assert from "node:assert";
import { describe, test } from "node:test";
import xmlParse from "../../src/origami/xmlParse.js";

describe("xmlParse", () => {
  test("parses an XML string into a plain object representing the DOM", async () => {
    const dom = await xmlParse("<root><child>Text</child></root>");
    assert.deepEqual(dom, {
      name: "root",
      children: [
        {
          name: "child",
          text: "Text",
        },
      ],
    });
  });
});
