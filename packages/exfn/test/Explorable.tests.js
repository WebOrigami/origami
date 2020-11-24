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
});
