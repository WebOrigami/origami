import path from "path";
import { fileURLToPath } from "url";
import FormulasMixin from "../../src/app/FormulasMixin.js";
import Compose from "../../src/common/Compose.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const directory = path.join(fixturesDirectory, "formulas");

class FormulasObject extends FormulasMixin(ExplorableObject) {}

class VirtualFiles extends FormulasMixin(ExplorableFiles) {}
const graph = new VirtualFiles(directory);
graph.scope = new Compose(
  {
    fn() {
      return "Hello, world.";
    },
  },
  graph.scope
);

describe("FormulasMixin", () => {
  it("can get a value defined by a variable pattern", async () => {
    const fixture = new FormulasObject({
      "{x}.txt": "Default text",
      "a.txt": "Specific text",
    });
    assert.equal(await fixture.get("a.txt"), "Specific text");
    assert.equal(await fixture.get("b.txt"), "Default text");
  });

  it("matches extensions", async () => {
    const fixture = new FormulasObject({
      "{x}.html": "html",
      "{y}": "no extension",
    });
    assert.equal(await fixture.get("foo.html"), "html");
    assert.equal(await fixture.get("bar.baz.html"), "html");
    assert.equal(await fixture.get("foo.json"), undefined); // Has extension
    assert.equal(await fixture.get("foo"), "no extension");
  });

  it("can compute keys for variable patterns", async () => {
    const fixture = new FormulasObject({
      "{x}.json": "html",
      a: "",
      b: "",
    });
    assert.deepEqual(await ExplorableGraph.keys(fixture), [
      "a",
      "a.json",
      "b",
      "b.json",
      "{x}.json",
    ]);
  });

  it("can compute keys for assignments", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.deepEqual(await ExplorableGraph.keys(fixture), ["a", "a = b", "b"]);
  });

  it("can get a value defined by an assignment", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.equal(await fixture.get("a"), "Hello");
  });

  it("first formula that returns a defined value is used", async () => {
    const fixture = new FormulasObject({
      a: undefined,
      "a = b": "",
      "a = c": "",
      b: undefined,
      c: "Hello",
    });
    assert.equal(await fixture.get("a"), "Hello");
  });

  it("can define assignments to variables", async () => {
    const fixture = new FormulasObject({
      "{name} = 'FOO'": "",
    });
    assert.equal(await fixture.get("alice"), "FOO");
    assert.equal(await fixture.get("bob"), "FOO");
  });

  it("can pass variable to right-hand side", async () => {
    const fixture = new FormulasObject({
      "{name} = quote $name": "",
    });
    assert.deepEqual(await fixture.get("alice"), ["alice"]);
    assert.deepEqual(await fixture.get("bob"), ["bob"]);
  });

  it("keys include both real and virtual keys", async () => {
    assert.deepEqual(await ExplorableGraph.keys(graph), [
      "foo.txt",
      "greeting",
      "greeting = ƒ('world').js",
      "obj",
      "obj = ƒ.json",
      "sample.txt",
      "sample.txt = ƒ().js",
      "string",
      "string = ƒ.json",
      "value",
      "value = fn()",
    ]);
  });

  // TODO: Move files graph tests to ExplorableApp

  it("can get the value of a virtual key", async () => {
    const buffer = await graph.get("string");
    const json = JSON.parse(String(buffer));
    assert.equal(json, "Hello, world.");
  });

  it("can produce a value using a function", async () => {
    const value = await graph.get("value");
    assert.equal(value, "Hello, world.");
  });
});
