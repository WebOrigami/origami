import parse from "../../src/eg/parse.js";
import assert from "../assert.js";

describe("parse", () => {
  it("parses text as text", () => {
    const parsed = parse("hello");
    assert.equal(parsed, "hello");
  });

  it("parses a function call", () => {
    const parsed = parse(` fn("arg")`);
    assert.deepEqual(parsed, ["fn", "arg"]);
  });

  it("can parse a function call with multiple arguments", () => {
    const parsed = parse(`fn("a", "b", "c")`);
    assert.deepEqual(parsed, ["fn", "a", "b", "c"]);
  });

  it("parses nested function calls", () => {
    const parsed = parse("a(b(c()))");
    assert.deepEqual(parsed, ["a", ["b", ["c"]]]);
  });

  it("parses function calls without parenthesis", () => {
    assert.deepEqual(parse("fn"), ["fn"]);
    assert.deepEqual(parse("fn 'arg'"), ["fn", "arg"]);
    assert.deepEqual(parse("fn 'arg1', 'arg2'"), ["fn", "arg1", "arg2"]);
    assert.deepEqual(parse("fn1 fn2 fn3"), ["fn1", ["fn2", ["fn3"]]]);
  });

  it.skip("parses a function with an initial parenthesis group", () => {
    assert.deepEqual(parse("(fn) 'a', 'b'"), [["fn"], "a", "b"]);
  });

  it("parses a module import", () => {
    const parsed = parse("foo.js");
    assert.deepEqual(parsed, [
      "defaultModuleExport",
      ["resolvePath", "foo.js"],
    ]);
  });

  it("parses a JSON file import", () => {
    const parsed = parse("foo.json");
    assert.deepEqual(parsed, [
      "parseJson",
      ["file", ["resolvePath", "foo.json"]],
    ]);
  });

  it("parses a YAML file import", () => {
    const parsed = parse("foo.yaml");
    assert.deepEqual(parsed, [
      "parseYaml",
      ["file", ["resolvePath", "foo.yaml"]],
    ]);
  });

  it("parses a single-quoted string", () => {
    const parsed = parse(`'Hello, world.'`);
    assert.deepEqual(parsed, "Hello, world.");
  });

  it("parses a double-quoted string", () => {
    const parsed = parse(`"Hello, world."`);
    assert.deepEqual(parsed, "Hello, world.");
  });

  it("parses a quoted string argument", () => {
    const parsed = parse(`foo("Hello, world.")`);
    assert.deepEqual(parsed, ["foo", "Hello, world."]);
  });

  it("parses a URL", () => {
    assert.deepEqual(parse("//foo/bar"), ["site", "//foo/bar"]);
    assert.deepEqual(parse("https://example.com"), [
      "site",
      "https://example.com",
    ]);
  });

  it("parses a path", () => {
    assert.deepEqual(parse("file.txt"), "file.txt");
    assert.deepEqual(parse("foo bar.txt"), ["foo", "bar.txt"]); // contains whitespace
    assert.deepEqual(parse("./file.txt"), "./file.txt");
    assert.deepEqual(parse("fn(foo)"), ["fn", ["foo"]]);
    assert.deepEqual(parse("fn(./foo)"), ["fn", "./foo"]);
  });

  it("parses an assignment", () => {
    assert.deepEqual(parse("a = b"), ["=", "a", ["b"]]);
    assert.deepEqual(parse("a="), ["=", "a"]); // Unbound assignment
    assert.deepEqual(parse("foo = fn bar.txt"), [
      "=",
      "foo",
      ["fn", "bar.txt"],
    ]);
  });

  it("parses an assignment with a file extension", () => {
    assert.deepEqual(parse("a=.js"), [
      "=",
      "a",
      ["defaultModuleExport", ["resolvePath", "a=.js"]],
    ]);
    assert.deepEqual(parse("foo =.js"), [
      "=",
      "foo",
      ["defaultModuleExport", ["resolvePath", "foo =.js"]],
    ]);
    assert.deepEqual(parse("foo =.json"), [
      "=",
      "foo",
      ["parseJson", ["file", ["resolvePath", "foo =.json"]]],
    ]);
    assert.deepEqual(parse("foo = .yaml"), [
      "=",
      "foo",
      ["parseYaml", ["file", ["resolvePath", "foo = .yaml"]]],
    ]);
  });

  it("parses a parentheical group", () => {
    assert.deepEqual(parse("(fn)"), ["fn"]);
    assert.deepEqual(parse("fn (('text'))"), ["fn", "text"]);
  });
});
