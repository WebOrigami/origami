import assert from "node:assert";
import { describe, test } from "node:test";
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
    assert.deepEqual(dom, {
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
