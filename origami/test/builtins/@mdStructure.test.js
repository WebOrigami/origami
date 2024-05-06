import assert from "node:assert";
import { describe, test } from "node:test";
import mdStructure from "../../src/builtins/@mdTree.js";

describe("@mdStructure", () => {
  test("returns markdown headings as a structured object", async () => {
    const text = `
Introduction
# Heading 1
Text beneath heading 1
## Heading 1.1
Text beneath heading 1.1
## Heading 1.2
### Heading 1.2.1
# Heading 2
More text
## Heading 2.1
`;
    const outline = mdStructure(text);
    assert.deepEqual(outline, {
      "Heading 1": {
        "Heading 1.1": null,
        "Heading 1.2": {
          "Heading 1.2.1": null,
        },
      },
      "Heading 2": {
        "Heading 2.1": null,
      },
    });
  });

  test("generates an intermediate unnamed heading if a level is skipped", async () => {
    const text = `
# Heading 1
### Surprising Heading 1.1.1
`;
    const outline = mdStructure(text);
    const h1 = outline["Heading 1"];
    const h2 = h1[Object.getOwnPropertySymbols(h1)[0]];
    assert.deepEqual(h2, {
      "Surprising Heading 1.1.1": null,
    });
  });
});
