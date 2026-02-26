import assert from "node:assert";
import { describe, test } from "node:test";
import mergeDebugResources from "../../src/dev/debug2/mergeDebugResources.js";

describe("mergeDebugResources", () => {
  test("defines default index.html", async () => {
    const obj = {
      firstKey: 1,
      secondKey: 2,
    };
    const merged = mergeDebugResources(obj);
    const indexHtml = await merged.get("index.html");
    assert(indexHtml.includes("firstKey"));
    assert(indexHtml.includes("secondKey"));
  });
});
