import { asyncGet, get, keys } from "@explorablegraph/symbols";
import chai from "chai";
import AsyncExplorable from "../../core/src/AsyncExplorable.js";
import Explorable from "../src/Explorable.js";
const { assert } = chai;

describe("Explorable", () => {
  it("can instantiate with either class function call or new operator", () => {
    const constructFixture = Explorable();
    assert.equal(constructFixture[get]("hello"), undefined);
    assert.deepEqual([...constructFixture], []);

    const newFixture = new Explorable();
    assert.equal(newFixture[get]("hello"), undefined);
    assert.deepEqual([...newFixture], []);
  });

  it("constructor implicitly converts a plain object argument to an ExplorablePlainObject", () => {
    const constructObj = Explorable({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.equal(constructObj[get]("a"), 1);
    assert.equal(constructObj[get]("b"), 2);
    assert.equal(constructObj[get]("c"), 3);
    assert.equal(constructObj[get]("x"), undefined);
    assert.deepEqual([...constructObj], ["a", "b", "c"]);

    const newObj = new Explorable({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.equal(newObj[get]("a"), 1);
    assert.equal(newObj[get]("b"), 2);
    assert.equal(newObj[get]("c"), 3);
    assert.equal(newObj[get]("x"), undefined);
    assert.deepEqual([...newObj], ["a", "b", "c"]);
  });

  it("Can determine whether an object is a sync exfn", () => {
    const neitherCallNorIterator = {};
    assert(!(neitherCallNorIterator instanceof Explorable));

    const getWithoutKeys = {
      [get]() {},
    };
    assert(!(getWithoutKeys instanceof Explorable));

    const keysWithoutGet = {
      [keys]() {},
    };
    assert(!(keysWithoutGet instanceof Explorable));

    // Valid sync exfn has both get and keys
    const getAndSyncIterator = {
      [get]() {},
      [keys]() {},
    };
    assert(getAndSyncIterator instanceof Explorable);
  });

  it("Passes the test for an async explorable as well", async () => {
    const fixture = new Explorable({
      a: 1,
      b: 2,
      c: 3,
    });
    assert(fixture instanceof AsyncExplorable);

    assert.equal(await fixture[asyncGet]("a"), 1);
    assert.equal(await fixture[asyncGet]("x"), undefined);

    const keys = [];
    for await (const key of fixture) {
      keys.push(key);
    }
    assert.deepEqual(keys, ["a", "b", "c"]);
  });
});
