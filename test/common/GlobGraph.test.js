import GlobGraph from "../../src/common/GlobGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("GlobGraph", () => {
  it("matches globs", async () => {
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

  it("matches nested globs", async () => {
    const globGraph = new GlobGraph({
      sub: {
        foo: "bar",
        "*": "default",
      },
    });
    assert.equal(
      await ExplorableGraph.traverse(globGraph, "sub", "file"),
      "default"
    );
    assert.equal(
      await ExplorableGraph.traverse(globGraph, "sub", "foo"),
      "bar"
    );
  });
});
