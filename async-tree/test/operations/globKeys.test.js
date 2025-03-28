import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import globKeys from "../../src/operations/globKeys.js";

describe("globKeys", () => {
  test("matches globs", async () => {
    const globTree = globKeys({
      "*.txt": true,
      "*.js": false,
      "*.jsx": true,
      "foo*baz": true,
    });
    assert(await globTree.get("file.txt"));
    assert(!(await globTree.get("script.js")));
    assert(await globTree.get("component.jsx"));
    assert(await globTree.get("foobarbaz"));
    assert(await globTree.get("foobaz"));
    assert(!(await globTree.get("foo")));
  });

  test("matches nested globs", async () => {
    const globTree = globKeys({
      sub: {
        foo: "bar",
        "*": "default",
      },
    });
    assert.equal(await Tree.traverse(globTree, "sub/", "file"), "default");
    assert.equal(await Tree.traverse(globTree, "sub/", "foo"), "bar");
  });

  test("supports deep matches with globstar", async () => {
    const globTree = globKeys({
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
