import { asyncGet, get } from "@explorablegraph/symbols";
import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
import Explorable from "../src/Explorable.js";
import explorableBuiltIn from "../src/explorablePlainObject.js";
const { assert } = chai;

describe("explorablePlainObject", () => {
  it("can explore a plain JavaScript object", () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
    };
    const obj = new explorableBuiltIn(original);
    assert(obj instanceof Explorable);
    assert.equal(obj[get]("a"), 1);
    assert.equal(obj[get]("b"), 2);
    assert.equal(obj[get]("c"), 3);
    assert.equal(obj[get]("x"), undefined);
    assert.deepEqual([...obj], ["a", "b", "c"]);

    // Changes to original object are visible through get/keys.
    original.a = 4;
    original.d = 5;
    assert.equal(obj[get]("a"), 4);
    assert.equal(obj[get]("b"), 2);
    assert.equal(obj[get]("c"), 3);
    assert.equal(obj[get]("d"), 5);
    assert.equal(obj[get]("x"), undefined);
    assert.deepEqual([...obj], ["a", "b", "c", "d"]);

    // Changes applied to the proxy are also represented.
    obj.e = 6;
    assert.equal(obj[get]("e"), 6);
    assert.deepEqual([...obj], ["a", "b", "c", "d", "e"]);
  });

  it("can async explore a plain JavaScript object", async () => {
    const obj = new explorableBuiltIn({
      a: 1,
      b: 2,
      c: 3,
    });
    assert(obj instanceof AsyncExplorable);
    assert.equal(await obj[asyncGet]("a"), 1);
    assert.equal(await obj[asyncGet]("b"), 2);
    assert.equal(await obj[asyncGet]("c"), 3);
    assert.equal(await obj[asyncGet]("x"), undefined);

    const keys = [];
    for await (const key of obj) {
      keys.push(key);
    }
    assert.deepEqual(keys, ["a", "b", "c"]);
  });
});
