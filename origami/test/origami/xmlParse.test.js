import assert from "node:assert";
import { describe, test } from "node:test";
import domObject from "../../src/origami/domObject.js";
import xmlParse from "../../src/origami/xmlParse.js";

describe("xmlParse", () => {
  test("parses an XML string into a plain object representing the DOM", async () => {
    const dom = await xmlParse("<root><child>Text</child></root>");
    const object = await domObject(dom);
    assert.deepEqual(object, {
      children: [
        {
          name: "child",
          text: "Text",
        },
      ],
      name: "root",
    });
  });
});
