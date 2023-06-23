import assert from "node:assert";
import { describe, test } from "node:test";
import render from "../../../src/builtins/@frontMatter/render.js";
import StringWithGraph from "../../../src/common/StringWithGraph.js";

describe("@frontMatter/render", () => {
  test("renders front matter as YAML", async () => {
    const value = new StringWithGraph("text", {
      a: 1,
    });
    const result = await render(value);
    assert.equal(
      result,
      `---
a: 1
---
text`
    );
  });
});
