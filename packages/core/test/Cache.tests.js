import { asyncGet } from "@explorablegraph/symbols";
import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
import * as asyncOps from "../src/asyncOps.js";
import Cache from "../src/Cache.js";
const { assert } = chai;

describe("Cache", () => {
  it("returns the first defined value from an ordered list of graphs", async () => {
    const cache = new AsyncExplorable({});
    const fixture = new Cache(cache, {
      a: 1,
      b: 2,
      c: 3,
    });
    const keys = await asyncOps.keys(fixture);
    assert.deepEqual(keys, ["a", "b", "c"]);
    assert.equal(await fixture[asyncGet]("a"), 1);
    assert.equal(await fixture[asyncGet]("b"), 2);
  });
});
