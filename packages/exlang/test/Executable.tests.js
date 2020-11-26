import { ExplorableMap, get } from "@explorablegraph/exfn";
import chai from "chai";
import { argumentMarker, default as Executable } from "../src/Executable.js";
const { assert } = chai;

describe.skip("Executable", () => {
  it("can execute, passing an argument all the way down to an inner function", () => {
    function greet(name) {
      return `Hello ${name}`;
    }
    const map = new Map([[greet, argumentMarker]]);
    const exfn = new ExplorableMap(map);
    const executable = new Executable(exfn);
    const result = executable[get]("world");
    assert.equal(result, "Hello world");
  });
});
