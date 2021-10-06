import MetaGraph from "../../src/common/MetaGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe.only("MetaGraph", () => {
  it("runs", async () => {
    const map = {
      title: "Home page",
      more: "$graph/moredata",
    };
    const target = {
      moredata: {
        message: "Hello, world.",
      },
    };
    const meta = new MetaGraph(map, target);
    assert.deepEqual(await ExplorableGraph.plain(meta), {
      title: "Home page",
      more: {
        message: "Hello, world.",
      },
    });
  });
});
