import MergeGraph from "../../src/common/MergeGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

describe("MergeGraph", () => {
  it("returns the first defined value from an ordered list of graphs", async () => {
    const fixture = new MergeGraph(
      {
        a: 1,
        c: 3,
      },
      {
        b: 2,
        c: 0, // Will be obscured by `c` above
        d: 4,
      }
    );
    const keys = await ExplorableGraph.keys(fixture);
    assert.deepEqual(keys, ["a", "c", "b", "d"]);
    assert.equal(await fixture.get("a"), 1);
    assert.equal(await fixture.get("b"), 2);
    assert.equal(await fixture.get("c"), 3);
    assert.equal(await fixture.get("d"), 4);
    assert.equal(await fixture.get("x"), undefined);
  });
});
