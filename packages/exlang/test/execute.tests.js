import chai from "chai";
import { argumentMarker, default as execute } from "../src/execute.js";
const { assert } = chai;

describe("execute", () => {
  it("can execute, passing an argument all the way down to an inner function", () => {
    // Match array format from parse/link.
    function greet(name) {
      return `Hello ${name}`;
    }
    const linked = [greet, argumentMarker];
    const result = execute(linked, "world");
    assert.equal(result, "Hello world");
  });
});
