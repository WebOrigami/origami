import assert from "node:assert";
import { describe, test } from "node:test";
import domObject from "../../src/origami/domObject.js";
import htmlParse from "../../src/origami/htmlParse.js";

describe("htmlParse", () => {
  test("parses an HTML string into a plain object representing the DOM", async () => {
    const dom = await htmlParse(`
      <div class="container">
        <p>
          Hello <b>world</b>.
        </p>
      </div>
    `);
    const object = await domObject(dom);
    assert.deepEqual(object, {
      name: "div",
      attributes: { class: "container" },
      children: [
        {
          name: "p",
          children: [
            {
              name: "#text",
              text: " Hello ",
            },
            {
              name: "b",
              text: "world",
            },
            {
              name: "#text",
              text: ". ",
            },
          ],
        },
      ],
    });
  });
});
