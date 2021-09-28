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
  it("can define assignments to constants", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: "Hello",
      b: "Hello",
    });
  });

  it("first formula that returns a defined value is used", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      "a = c": "",
      b: undefined,
      c: "Hello",
    });
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: "Hello",
      b: undefined,
      c: "Hello",
    });
  });

  it("can define assignments to variables", async () => {
    const fixture = new FormulasObject({
      "{name} = 'NAME'": "",
    });
    assert.equal(await fixture.get("alice"), "NAME");
    assert.equal(await fixture.get("bob"), "NAME");
  });

  it.only("can pass variable to right-hand side", async () => {
    const fixture = new FormulasObject({
      "{name} = ƒ(quote {name})": (name) => name[0].toUpperCase(),
    });
    assert.equal(await fixture.get("alice"), "ALICE");
    assert.equal(await fixture.get("bob"), "BOB");
  });

  it("keys include both real and virtual keys", async () => {
    assert.deepEqual(await ExplorableGraph.keys(graph), [
      "foo.txt",
      "greeting",
      "obj",
      "sample.txt",
      "string",
      "value",
    ]);
  });

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
