import assert from "node:assert";
import { describe, test } from "node:test";
import audit from "../../src/site/crawler/audit.js";

describe("audit", () => {
  test("can report missing crawlable resources like pages", async () => {
    const tree = {
      "index.html": `<a href="missing.html">Missing</a>`,
    };
    const result = await audit.call(null, tree);
    assert.deepEqual(result, {
      "index.html": ["missing.html"],
    });
  });
});
