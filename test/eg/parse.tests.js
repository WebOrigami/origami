import parse from "../../src/eg/parse.js";
import assert from "../assert.js";

describe("parse", () => {
  it("recognizes text as text", () => {
    const parsed = parse("hello");
    assert.equal(parsed, "hello");
  });

  it("recognizes a function call", () => {
    const parsed = parse(` fn("arg")`);
    assert.deepEqual(parsed, ["fn", "arg"]);
  });

  it("can parse a function call with multiple arguments", () => {
    const parsed = parse(`fn("a", "b", "c")`);
    assert.deepEqual(parsed, ["fn", "a", "b", "c"]);
  });

  it("recognizes nested function calls", () => {
    const parsed = parse("a(b(c()))");
    assert.deepEqual(parsed, ["a", ["b", ["c"]]]);
  });

  it("recognizes function calls without parenthesis", () => {
    const parsed1 = parse("fn");
    assert.deepEqual(parsed1, ["fn"]);

    const parsed2 = parse("a b c");
    assert.deepEqual(parsed2, ["a", ["b", ["c"]]]);
  });

  it("recognizes a module import", () => {
    const parsed = parse("foo.js");
    assert.deepEqual(parsed, ["defaultModuleExport", "foo.js"]);
  });

  it("recognizes a JSON file import", () => {
    const parsed = parse("foo.json");
    assert.deepEqual(parsed, ["parseJson", ["file", "foo.json"]]);
  });

  it("recognizes a YAML file import", () => {
    const parsed = parse("foo.yaml");
    assert.deepEqual(parsed, ["parseYaml", ["file", "foo.yaml"]]);
  });

  it("recognizes a quoted string", () => {
    const parsed = parse(`"Hello, world."`);
    assert.deepEqual(parsed, "Hello, world.");
  });

  it("recognizes a quoted string argument", () => {
    const parsed = parse(`foo("Hello, world.")`);
    assert.deepEqual(parsed, ["foo", "Hello, world."]);
  });

  it("recognizes a path", () => {
    assert.deepEqual(parse("file.txt"), "file.txt");
    assert.deepEqual(parse("foo bar.txt"), ["foo", "bar.txt"]); // contains whitespace
    assert.deepEqual(parse("./file.txt"), "./file.txt");
    assert.deepEqual(parse("//foo/bar"), "//foo/bar");
    assert.deepEqual(parse("fn(foo)"), ["fn", ["foo"]]);
    assert.deepEqual(parse("fn(./foo)"), ["fn", "./foo"]);
  });

  it("recognizes an assignment", () => {
    assert.deepEqual(parse("a = b"), ["=", "a", ["b"]]);
    assert.deepEqual(parse("a="), ["=", "a"]); // Unbound assignment
    assert.deepEqual(parse("foo = fn bar.txt"), [
      "=",
      "foo",
      ["fn", "bar.txt"],
    ]);
  });

  it("recognizes an assignment with a file extension", () => {
    assert.deepEqual(parse("a=.js"), [
      "=",
      "a",
      ["defaultModuleExport", "a=.js"],
    ]);
    assert.deepEqual(parse("foo =.js"), [
      "=",
      "foo",
      ["defaultModuleExport", "foo =.js"],
    ]);
    assert.deepEqual(parse("foo =.json"), [
      "=",
      "foo",
      ["parseJson", ["file", "foo =.json"]],
    ]);
    assert.deepEqual(parse("foo = .yaml"), [
      "=",
      "foo",
      ["parseYaml", ["file", "foo = .yaml"]],
    ]);
  });
});
