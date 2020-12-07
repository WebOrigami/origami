import { asyncGet } from "@explorablegraph/symbols";
import chai from "chai";
import * as asyncOps from "../src/asyncOps.js";
import Compose from "../src/Compose.js";
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
    const keys = await asyncOps.keys(fixture);
    assert.deepEqual(keys, ["a", "c", "b", "d"]);
    assert.equal(await fixture[asyncGet]("a"), 1);
    assert.equal(await fixture[asyncGet]("b"), 2);
    assert.equal(await fixture[asyncGet]("c"), 3);
    assert.equal(await fixture[asyncGet]("d"), 4);
    assert.equal(await fixture[asyncGet]("x"), undefined);
  });
});
