import { get } from "@explorablegraph/symbols";
import chai from "chai";
import Explorable from "../src/Explorable.js";
import ExplorableMap from "../src/ExplorableMap.js";
const { assert } = chai;

describe("ExplorableMap", () => {
  it("can explore a standard JavaScript Map", () => {
    const map = new Map([
      ["a", 1],
      ["b", 2],
      ["c", 3],
    ]);
    const exfn = new ExplorableMap(map);
    assert(exfn instanceof Explorable);
    assert.equal(exfn[get]("a"), 1);
    assert.equal(exfn[get]("b"), 2);
    assert.equal(exfn[get]("c"), 3);
    assert.equal(exfn[get]("x"), undefined);
  });
});
