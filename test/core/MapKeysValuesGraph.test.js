import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import MapKeysValuesGraph from "../../src/core/MapKeysValuesGraph.js";
import assert from "../assert.js";

// Test graph changes a lowercase inner key and its value to uppercase, but
// leaves uppercase inner keys and their values alone.
class UppercaseKeysGraph extends MapKeysValuesGraph {
  async innerKeyForOuterKey(outerKey) {
    return outerKey.toLowerCase();
  }

  async mapApplies(innerValue, outerKey, innerKey) {
    const base = await super.mapApplies(innerValue, outerKey, innerKey);
    return base;
  }

  async outerKeyForInnerKey(innerKey) {
    return innerKey.toUpperCase();
  }
}

describe("MapKeysValuesTest", () => {
  it("maps keys and values", async () => {
    const inner = {
      a: "hello, a.",
      // This manually-specified uppercase key should be used directly.
      B: "Goodbye, B.",
      c: "goodnight, c.",
    };
    const outer = new UppercaseKeysGraph(inner, (value) => value.toUpperCase());
    assert.deepEqual(await ExplorableGraph.plain(outer), {
      A: "HELLO, A.",
      B: "Goodbye, B.",
      C: "GOODNIGHT, C.",
    });
  });
});
