import assert from "node:assert";
import { describe, test } from "node:test";
import slug from "../../src/site/slug.js";

describe("slug", () => {
  test("converts file names to slugs for URLs", async () => {
    assert.equal(slug("Hello, World! 2021.md"), "hello-world-2021.md");
    assert.equal(slug("  foo  bar  "), "foo-bar");
  });
});
