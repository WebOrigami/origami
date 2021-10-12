import * as utilities from "../../src/core/utilities.js";
import assert from "../assert.js";

describe("utilities", () => {
  it("extractFrontMatter() returns front matter if found", () => {
    const text = utilities.extractFrontMatter(`---
a: Hello, a.
---
This is the content.
`);
    assert.deepEqual(text, {
      a: "Hello, a.",
      content: "This is the content.\n",
    });
  });

  it("extractFrontMatter returns null if no front matter is found", () => {
    const text = "a: Hello, a.";
    assert.isNull(utilities.extractFrontMatter(text));
  });
});
