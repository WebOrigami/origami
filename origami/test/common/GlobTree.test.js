import { Tree } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import GlobTree from "../../src/common/GlobTree.js";

describe("GlobTree", () => {
  test("matches globs", async () => {
    const globTree = new GlobTree({
      "*.txt": true,
      "*.js": false,
      "*.jsx": true,
      "foo*baz": true,
    });
    assert(await globTree.get("file.txt"));
    assert(!(await globTree.get("script.js")));
    assert(await globTree.get("component.jsx"));
    assert(await globTree.get("foobarbaz"));
    assert(!(await globTree.get("foobaz")));
    assert(!(await globTree.get("foo")));
  });

  test("matches nested globs", async () => {
    const globTree = new GlobTree({
      sub: {
        foo: "bar",
        "*": "default",
      },
    });
    assert.equal(await Tree.traverse(globTree, "sub", "file"), "default");
    assert.equal(await Tree.traverse(globTree, "sub", "foo"), "bar");
  });
});
