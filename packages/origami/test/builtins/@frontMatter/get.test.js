import assert from "node:assert";
import { describe, test } from "node:test";
import get from "../../../src/builtins/@frontMatter/get.js";

describe("@frontMatter/get", () => {
  test("returns associated front matter", async () => {
    const text = "---\na: 1\n---\nBody text";
    const data = await get(text);
    assert.deepEqual(data, { a: 1 });
  });
});
