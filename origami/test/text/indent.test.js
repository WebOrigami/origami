import assert from "node:assert";
import { describe, test } from "node:test";
import indent from "../../src/text/indent.js";

describe("indent", () => {
  test("joins strings and values together if template isn't a block template", () => {
    const result = indent`a ${"b"} c`;
    assert.equal(result, "a b c");
  });

  test("removes first and last lines if template is a block template", () => {
    const actual = indent`
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
    const actual = indent`
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
