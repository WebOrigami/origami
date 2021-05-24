import chai from "chai";
import Compose from "../../src/common/Compose.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
const { assert } = chai;

describe("Compose", () => {
  it("returns the first defined value from an ordered list of graphs", async () => {
    const fixture = new Compose(
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
