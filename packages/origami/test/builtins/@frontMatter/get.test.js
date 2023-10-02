import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import get from "../../../src/builtins/@frontMatter/get.js";
import FrontMatterDocument from "../../../src/common/FrontMatterDocument.js";

describe("@frontMatter/get", () => {
  test("returns associated front matter", async () => {
    const document = new FrontMatterDocument("text", {
      frontData: {
        a: 1,
      },
    });
    const graph = await get(document);
    assert.deepEqual(await Graph.plain(graph), { a: 1 });
  });
});
