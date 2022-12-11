import GlobGraph from "../../src/common/GlobGraph.js";
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
});
