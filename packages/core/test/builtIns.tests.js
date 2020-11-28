import chai from "chai";
import * as builtIns from "../src/builtIns.js";
const { assert } = chai;

describe("builtIns", () => {
  it("can make a JavaScript built-in object explorable", () => {
    const fixture = builtIns.explorable({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.deepEqual([...fixture], ["a", "b", "c"]);
  });
});
