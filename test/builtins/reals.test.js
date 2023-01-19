import reals from "../../src/builtins/reals.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import MetaTransform from "../../src/framework/MetaTransform.js";
import assert from "../assert.js";

describe("reals", () => {
  it("returns only the real portion of a graph", async () => {
    const fixture = new (MetaTransform(ObjectGraph))({
      "a = b": "",
      b: "Hello",
    });
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: "Hello",
      b: "Hello",
    });
    const result = await reals(fixture);
    assert.deepEqual(await ExplorableGraph.plain(result), {
      "a = b": "",
      b: "Hello",
    });
  });
});
