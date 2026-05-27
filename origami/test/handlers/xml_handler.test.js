import assert from "node:assert";
import { describe, test } from "node:test";
import xml_handler from "../../src/handlers/xml_handler.js";
import domObject from "../../src/origami/domObject.js";

describe("XML handler", () => {
  test("unpacks XML data", async () => {
    const xmlString = `<root>
  <item id="1">First</item>
  <item id="2">Second</item>
</root>`;
    const dom = await xml_handler.unpack(xmlString);
    const object = await domObject(dom);
    assert.deepEqual(object, {
      name: "root",
      children: [
        { name: "item", attributes: { id: "1" }, text: "First" },
        { name: "item", attributes: { id: "2" }, text: "Second" },
      ],
    });
  });
});
