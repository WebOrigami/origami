import assert from "node:assert";
import { describe, test } from "node:test";
import indent from "../../src/runtime/templateIndent.js";

describe("taggedTemplateIndent", () => {
  test("joins strings and values together if template isn't a block template", async () => {
    const result = await indent`a ${"b"} c`;
    assert.equal(result, "a b c");
  });

  test("removes first and last lines if template is a block template", async () => {
    const actual = await indent`
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

  test("indents all lines in a block substitution", async () => {
    const lines = `
Line 1
Line 2
Line 3`.trimStart();
    const actual = await indent`
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
