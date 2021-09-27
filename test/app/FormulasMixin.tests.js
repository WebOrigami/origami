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
  it("graph includes both real and virtual values", async () => {
    const fixture = new FormulasObject({
      "a = b": "",
      b: "Hello",
    });
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      a: "Hello",
      b: "Hello",
    });
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
