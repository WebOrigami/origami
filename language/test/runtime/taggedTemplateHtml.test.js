import assert from "node:assert";
import { describe, test } from "node:test";
import taggedTemplateHtml from "../../src/runtime/taggedTemplateHtml.js";

describe("taggedTemplateHtml", () => {
  test("joins strings and values together if template isn't a block template", () => {
    const result = taggedTemplateHtml`a ${"b"} c`;
    assert.equal(result, "a b c");
  });

  test("removes first and last lines if template is a block template", () => {
    const actual = taggedTemplateHtml`
    <p>
      Hello, ${"Alice"}!
    </p>
    `;
    const expected = `
<p>
  Hello, Alice!
</p>
`.trimStart();
    assert.equal(actual, expected);
  });

  test("indents all lines in a block substitution", () => {
    const lines = `
Line 1
Line 2
Line 3`.trimStart();
    const actual = taggedTemplateHtml`
    <main>
      ${lines}
    </main>
    `;
    const expected = `
<main>
  Line 1
  Line 2
  Line 3
</main>
`.trimStart();
    assert.equal(actual, expected);
  });
});
