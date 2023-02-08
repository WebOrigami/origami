import clean from "../../src/builtins/clean.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import assert from "../assert.js";

describe("clean", () => {
  it("removes files indicated in .ori.clean.yaml", async () => {
    const graph = new ObjectGraph({
      ".ori.clean.yaml": ExplorableGraph.fromYaml("? a"),
      "a = 'Hello'": "",
      a: "Hello",
    });
    await clean(graph);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      "a = 'Hello'": "",
    });
  });
});
