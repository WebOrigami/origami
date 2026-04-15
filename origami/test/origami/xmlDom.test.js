import assert from "node:assert";
import { describe, test } from "node:test";
import xmlDom from "../../src/origami/xmlDom.js";

describe("xmlDom", () => {
  test("parses an XML string into a plain object representing the DOM", async () => {
    const dom = await xmlDom("<root><child>Text</child></root>");
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
