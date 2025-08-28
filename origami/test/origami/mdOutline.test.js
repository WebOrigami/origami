import assert from "node:assert";
import { describe, test } from "node:test";
import mdOutline from "../../src/origami/mdOutline.js";

describe("mdOutline", () => {
  test("returns the outline for a markdown document", async () => {
    const markdown = `
Introduction

# Section 1

Introduction for section 1

## Section 1.1

Text of section 1.1.

More text

## Section 1.2

Text of section 1.2.

# Section 2

## Section 2.1

Introduction for section 2.1

### Section 2.1.1

Text of section 2.1.1.
`;
    const outline = await mdOutline(markdown);
    assert.deepStrictEqual(outline, {
      _text: "Introduction",
      "Section 1": {
        _text: "Introduction for section 1",
        "Section 1.1": "Text of section 1.1.\n\nMore text",
        "Section 1.2": "Text of section 1.2.",
      },
      "Section 2": {
        "Section 2.1": {
          _text: "Introduction for section 2.1",
          "Section 2.1.1": "Text of section 2.1.1.",
        },
      },
    });
  });

  test("document with no headings", async () => {
    const markdown = `This is a document with no headings.`;
    const outline = await mdOutline(markdown);
    assert.deepStrictEqual(outline, {
      _text: "This is a document with no headings.",
    });
  });
});
