import assert from "node:assert";
import { describe, test } from "node:test";
import htmlDom from "../../src/origami/htmlDom.js";

describe("htmlDom", () => {
  test("parses an HTML string into a plain object representing the DOM", async () => {
    const dom = await htmlDom(`
      <div class="container">
        <p>
          Hello <b>world</b>.
        </p>
      </div>
    `);
    assert.deepEqual(dom, {
      name: "div",
      attributes: { class: "container" },
      children: [
        {
          name: "p",
          children: [
            {
              name: "#text",
              text: "\n          Hello ",
            },
            {
              name: "b",
              text: "world",
            },
            {
              name: "#text",
              text: ".\n        ",
            },
          ],
        },
      ],
    });
  });
});
