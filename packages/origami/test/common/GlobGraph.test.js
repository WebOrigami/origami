import { GraphHelpers } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import GlobGraph from "../../src/common/GlobGraph.js";

describe("GlobGraph", () => {
  test("matches globs", async () => {
    const globGraph = new GlobGraph({
      "*.txt": true,
      "*.js": false,
      "*.jsx": true,
      "foo*baz": true,
    });
    assert(await globGraph.get("file.txt"));
    assert(!(await globGraph.get("script.js")));
    assert(await globGraph.get("component.jsx"));
    assert(await globGraph.get("foobarbaz"));
    assert(!(await globGraph.get("foobaz")));
    assert(!(await globGraph.get("foo")));
  });

  test("matches nested globs", async () => {
    const globGraph = new GlobGraph({
      sub: {
        foo: "bar",
        "*": "default",
      },
    });
    assert.equal(
      await GraphHelpers.traverse(globGraph, "sub", "file"),
      "default"
    );
    assert.equal(await GraphHelpers.traverse(globGraph, "sub", "foo"), "bar");
  });
});
