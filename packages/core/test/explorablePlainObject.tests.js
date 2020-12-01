import { asyncGet, get } from "@explorablegraph/symbols";
import chai from "chai";
import AsyncExplorable from "../src/AsyncExplorable.js";
import Explorable from "../src/Explorable.js";
import explorablePlainObject from "../src/explorablePlainObject.js";
const { assert } = chai;

describe("explorablePlainObject", () => {
  it("can explore a plain JavaScript object", () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    };
    const obj = new explorablePlainObject(original);
    assert(obj instanceof Explorable);
    assert.equal(obj[get]("a"), 1);
    assert.equal(obj[get]("b"), 2);
    assert.equal(obj[get]("c"), 3);
    assert.equal(obj[get]("x"), undefined);
    assert.deepEqual([...obj], ["a", "b", "c", "more"]);

    // Changes to original object are visible through get/keys.
    original.a = 6;
    original.f = 7;
    assert.equal(obj[get]("a"), 6);
    assert.equal(obj[get]("b"), 2);
    assert.equal(obj[get]("c"), 3);
    assert.equal(obj[get]("f"), 7);
    assert.equal(obj[get]("x"), undefined);
    assert.deepEqual([...obj], ["a", "b", "c", "more", "f"]);

    // Changes applied to the proxy are also represented.
    obj.g = 8;
    assert.equal(obj[get]("g"), 8);
    assert.deepEqual([...obj], ["a", "b", "c", "more", "f", "g"]);
  });

  it("can traverse a path of keys", () => {
    const obj = new explorablePlainObject({
      a1: 1,
      a2: {
        b1: 2,
        b2: {
          c1: 3,
          c2: 4,
        },
      },
    });
    assert.equal(obj[get]("a1"), 1);
    assert.equal(obj[get]("a2", "b2", "c2"), 4);
    assert.equal(obj[get]("a2", "doesntexist", "c2"), undefined);
  });

  it("can traverse from one explorable into another", () => {
    const objB = new explorablePlainObject({
      b1: {
        b2: 1,
      },
    });
    const objA = new explorablePlainObject({
      a1: {
        a2: objB,
      },
    });
    assert.equal(objA[get]("a1", "a2", "b1", "b2"), 1);
  });

  it("can async explore a plain JavaScript object", async () => {
    const obj = new explorablePlainObject({
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
