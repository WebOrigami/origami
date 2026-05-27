import assert from "node:assert";
import { describe, test } from "node:test";
import html_handler from "../../src/handlers/html_handler.js";
import { default as fetchBuiltin } from "../../src/origami/fetch.js";

describe("fetch", () => {
  test("can unpack based on MIME content type", async () => {
    /** @type {any} */
    const parent = new Map();
    parent.globals = {
      html_handler,
    };
    const buffer = await fetchBuiltin("https://weborigami.org", null, {
      parent,
    });
    const dom = await buffer.unpack();
    const title = dom.querySelector("title").textContent;
    assert.strictEqual(title, "Web Origami");
  });
});
