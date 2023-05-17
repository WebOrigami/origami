import get from "../../../src/builtins/@frontMatter/get.js";
import StringWithGraph from "../../../src/common/StringWithGraph.js";
import ExplorableGraph from "../../../src/core/ExplorableGraph.js";
import assert from "../../assert.js";

describe("@frontMatter/get", () => {
  it("returns associated front matter", async () => {
    const text = new StringWithGraph("text", {
      a: 1,
    });
    const graph = await get(text);
    assert.deepEqual(await ExplorableGraph.plain(graph), { a: 1 });
  });
});
