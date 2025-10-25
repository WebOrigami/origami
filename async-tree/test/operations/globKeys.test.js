import assert from "node:assert";
import { describe, test } from "node:test";
import { Tree } from "../../src/internal.js";
import globKeys from "../../src/operations/globKeys.js";

describe("globKeys", () => {
  test("matches globs", async () => {
    const globMap = await globKeys({
      "*.txt": true,
      "*.js": false,
      "*.jsx": true,
      "foo*baz": true,
    });
    assert(globMap.get("file.txt"));
    assert(!globMap.get("script.js"));
    assert(globMap.get("component.jsx"));
    assert(globMap.get("foobarbaz"));
    assert(globMap.get("foobaz"));
    assert(!globMap.get("foo"));
  });

  test("matches nested globs", async () => {
    const globTree = await globKeys({
      sub: {
        foo: "bar",
        "*": "default",
      },
    });
    assert.equal(await Tree.traverse(globTree, "sub/", "file"), "default");
    assert.equal(await Tree.traverse(globTree, "sub/", "foo"), "bar");
  });

  test("supports deep matches with globstar", async () => {
    const globTree = await globKeys({
      "**": {
        "*.txt": true, // More specific glob pattern must come
        "*": false,
      },
      sub: {
        "*.md": true,
      },
      "s*": {
        "*.html": true,
      },
    });
    assert.equal(await Tree.traverse(globTree, "a/", "b/", "foo.txt"), true);
    assert.equal(await Tree.traverse(globTree, "c/", "foo"), false);
    assert.equal(await Tree.traverse(globTree, "sub/", "file.md"), true);
    assert.equal(await Tree.traverse(globTree, "sub/", "file.txt"), true);
    assert.equal(await Tree.traverse(globTree, "sub/", "file.html"), true);
    assert.equal(await Tree.traverse(globTree, "sub/", "file"), false);
  });
});
