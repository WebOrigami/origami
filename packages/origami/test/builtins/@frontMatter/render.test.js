import assert from "node:assert";
import { describe, test } from "node:test";
import render from "../../../src/builtins/@frontMatter/render.js";

describe("@frontMatter/render", () => {
  test("renders front matter as YAML", async () => {
    const textWithFrontMatter = await render("text", {
      a: 1,
    });
    assert.equal(
      textWithFrontMatter,
      `---
a: 1
---
text`
    );
  });
});
