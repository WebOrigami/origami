import chai from "chai";
import parse from "../src/parse.js";
const { assert } = chai;

describe("parse", () => {
  it("recognizes text as text", () => {
    const parsed = parse("hello");
    assert.deepEqual(parsed, "hello");
  });

  it("recognizes a function call", () => {
    const parsed = parse(" fn ( arg ) ");
    assert.deepEqual(parsed, ["fn", "arg"]);
  });

  it("recognizes a nested function call", () => {
    const parsed = parse("a(b(c))");
    assert.deepEqual(parsed, ["a", ["b", "c"]]);
  });
});
