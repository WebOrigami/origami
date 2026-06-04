import assert from "node:assert";
import { describe, test } from "node:test";
import htmlEscape from "../../src/origami/htmlEscape.js";

describe("htmlEscape", () => {
  test("escapes HTML entities", async () => {
    const result = await htmlEscape('<div>Test & "Escape"</div>');
    assert.strictEqual(result, `&lt;div&gt;Test &amp; "Escape"&lt;/div&gt;`);
  });
});
