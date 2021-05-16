import { get, keys } from "@explorablegraph/symbols";
import chai from "chai";
import Explorable from "../src/Explorable.js";
import ExplorableMap from "../src/ExplorableMap.js";
import explorablePlainObject from "../src/explorablePlainObject.js";
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
    assert.deepEqual([...exfn[keys]()], ["a", "b", "c"]);
    assert.equal(exfn[get](), exfn);
    assert.equal(exfn[get]("a"), 1);
    assert.equal(exfn[get]("b"), 2);
    assert.equal(exfn[get]("c"), 3);
    assert.equal(exfn[get]("x"), undefined);
  });

  it("can traverse a map into an object", () => {
    const map = new ExplorableMap(
      new Map([
        [
          "obj",
          new explorablePlainObject({
            a: 1,
          }),
        ],
      ])
    );
    assert.equal(map[get]("obj", "a"), 1);
  });
});
