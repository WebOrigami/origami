import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import get from "../../../src/builtins/@frontMatter/get.js";
import TextFile from "../../../src/common/TextFile.js";

describe("@frontMatter/get", () => {
  test("returns associated front matter", async () => {
    const textFile = new TextFile("text", {
      a: 1,
    });
    const graph = await get(textFile);
    assert.deepEqual(await Graph.plain(graph), { a: 1 });
  });
});
