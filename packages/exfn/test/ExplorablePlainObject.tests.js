import { get } from "@explorablegraph/symbols";
import chai from "chai";
import Explorable from "../src/Explorable.js";
import ExplorablePlainObject from "../src/ExplorablePlainObject.js";
const { assert } = chai;

describe("ExplorablePlainObject", () => {
  it("can explore a plain JavaScript object", () => {
    const obj = new ExplorablePlainObject({
      a: 1,
      b: 2,
      c: 3,
    });
    assert(obj instanceof Explorable);
    assert.equal(obj[get]("a"), 1);
    assert.equal(obj[get]("b"), 2);
    assert.equal(obj[get]("c"), 3);
    assert.equal(obj[get]("x"), undefined);
    assert.deepEqual([...obj], ["a", "b", "c"]);
  });
});
