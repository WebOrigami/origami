import chai from "chai";
import { call, default as Explorable } from "../src/Explorable.js";
const { assert } = chai;

describe.only("Explorable", () => {
  it("an object can expose the [Explorable.call] symbol to make itself invocable", () => {
    const fixture = {
      [call](arg) {
        return `Got ${arg}`;
      },
    };
    const value = Explorable.call(fixture, "foo");
    assert.equal(value, "Got foo");
  });

  it("Explorable.call invokes a function directly", () => {
    const fixture = (a, b) => a + b;
    const value = Explorable.call(fixture, "foo", "bar");
    assert.equal(value, "foobar");
  });
});
