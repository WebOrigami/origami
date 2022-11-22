import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import HiddenKeysTransform from "../../src/framework/HiddenKeysTransform.js";
import KeysTransform from "../../src/framework/KeysTransform.js";
import assert from "../assert.js";

const HiddenKeysGraph = HiddenKeysTransform(KeysTransform(ObjectGraph));

describe("HiddenKeysTransform", () => {
  it("hides keys in parentheses", async () => {
    const graph = new HiddenKeysGraph({
      a: 1,
      "(b)": 2,
      c: 3,
      "(d)": 4,
    });
    const keys = await ExplorableGraph.keys(graph);
    assert.deepEqual(keys, ["a", "c"]);
  });
});
