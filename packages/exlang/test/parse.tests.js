import chai from "chai";
import { argumentMarker } from "../src/execute.js";
import parse from "../src/parse.js";
const { assert } = chai;

describe("parse", () => {
  it("recognizes text as text", () => {
    const parsed = parse("hello");
    assert.equal(parsed, "hello");
  });

  it("recognizes a solitary asterisk an argument marker", () => {
    const parsed = parse("*");
    assert.equal(parsed, argumentMarker);
  });

  it("recognizes a function call", () => {
    const parsed = parse(" fn ( arg ) ");
    assert.deepEqual(parsed, ["fn", "arg"]);
  });

  it("can parse a function call with multiple arguments", () => {
    const parsed = parse("fn(a, b(c), d)");
    assert.deepEqual(parsed, ["fn", "a", ["b", "c"], "d"]);
  });

  it("recognizes a nested function call", () => {
    const parsed = parse("a(b(c))");
    assert.deepEqual(parsed, ["a", ["b", "c"]]);
  });

  it("recognizes a module import", () => {
    const parsed = parse(":foo.js");
    assert.deepEqual(parsed, ["defaultModuleExport", "foo.js"]);
  });

  it("recognizes a quoted string", () => {
    const parsed = parse(`"Hello, world."`);
    assert.deepEqual(parsed, "Hello, world.");
  });

  it("recognizes a quoted string argument", () => {
    const parsed = parse(`foo("Hello, world.")`);
    assert.deepEqual(parsed, ["foo", "Hello, world."]);
  });

  // it.skip("recognizes a JSON literal", () => {
  //   const parsed = parse(`{ "foo": "bar" }`);
  //   assert.deepEqual(parsed, { foo: "bar " });
  // });
});
