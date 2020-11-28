import { get, keys } from "@explorablegraph/symbols";
import chai from "chai";
import Explorable from "../src/Explorable.js";
import ExplorableArray from "../src/ExplorableArray.js";
const { assert } = chai;

describe("ExplorableArray", () => {
  it("can explore a standard JavaScript Array", () => {
    const array = ["a", "b", "c"];
    const exfn = new ExplorableArray(array);
    assert(exfn instanceof Explorable);
    assert.deepEqual([...exfn[keys]()], [0, 1, 2]);
    assert.equal(exfn[get](0), "a");
    assert.equal(exfn[get](1), "b");
    assert.equal(exfn[get](2), "c");
    assert.equal(exfn[get](3), undefined);
  });
});
