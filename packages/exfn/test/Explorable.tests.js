import { get } from "@explorablegraph/symbols";
import chai from "chai";
import Explorable from "../src/Explorable.js";
const { assert } = chai;

describe("Explorable", () => {
  it("can instantiate with either class function call or new operator", () => {
    const constructNoArg = Explorable();
    assert.equal(constructNoArg[get]("hello"), undefined);
    assert.deepEqual([...constructNoArg], []);

    const constructArg = Explorable();
    assert.equal(constructArg[get]("hello"), undefined);
    assert.deepEqual([...constructArg], []);

    const newNoArg = new Explorable();
    assert.equal(newNoArg[get]("hello"), undefined);
    assert.deepEqual([...newNoArg], []);

    const newArg = new Explorable();
    assert.equal(newArg[get]("hello"), undefined);
    assert.deepEqual([...newArg], []);
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
});
