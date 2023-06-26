import { GraphHelpers } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import get from "../../../src/builtins/@frontMatter/get.js";
import StringWithGraph from "../../../src/common/StringWithGraph.js";

describe("@frontMatter/get", () => {
  test("returns associated front matter", async () => {
    const text = new StringWithGraph("text", {
      a: 1,
    });
    const graph = await get(text);
    assert.deepEqual(await GraphHelpers.plain(graph), { a: 1 });
  });
});
