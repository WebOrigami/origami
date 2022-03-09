import clean from "../../src/builtins/clean.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("clean", () => {
  it("removes files indicated in .ori.clean.yaml", async () => {
    const graph = new ExplorableObject({
      ".ori.clean.yaml": `a: ""\n`,
      "a = 'Hello'": "",
      a: "Hello",
    });
    await clean(graph);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      ".ori.clean.yaml": `a: ""\n`,
      "a = 'Hello'": "",
    });
  });
});
