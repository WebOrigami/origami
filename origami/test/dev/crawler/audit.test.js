import assert from "node:assert";
import { describe, test } from "node:test";
import audit from "../../../src/dev/crawler/audit.js";

describe("audit", () => {
  test("reports missing pages", async () => {
    const tree = {
      "index.html": `<a href="missing.html">Missing</a>`,
    };
    const result = await audit.call(null, tree);
    assert.deepEqual(result, {
      "index.html": ["missing.html"],
    });
  });

  test("reports missing resource", async () => {
    const tree = {
      "index.html": `<img src="missing.png">`,
    };
    const result = await audit.call(null, tree);
    assert.deepEqual(result, {
      "index.html": ["missing.png"],
    });
  });

  test("treats /foo or /foo/ as equivalent to /foo.html", async () => {
    const tree = {
      "index.html": `
        <a href="foo">Without slash</a>
        <a href="foo/">With slash</a>
      `,
      "foo.html": "Foo",
    };
    const result = await audit.call(null, tree);
    assert.equal(result, undefined);
  });
});
