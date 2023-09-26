import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import get from "../../../src/builtins/@frontMatter/get.js";
import TextWithContents from "../../../src/common/TextWithContents.js";

describe("@frontMatter/get", () => {
  test("returns associated front matter", async () => {
    const textFile = new TextWithContents("text", {
      a: 1,
    });
    const graph = await get(textFile);
    assert.deepEqual(await Graph.plain(graph), { a: 1 });
  });
});
