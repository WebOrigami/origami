import path from "path";
import { fileURLToPath } from "url";
import ExplorableApp from "../../src/app/ExplorableApp.js";
import Compose from "../../src/common/Compose.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

const formulasGraph = new ExplorableApp(
  path.join(fixturesDirectory, "formulas")
);
formulasGraph.scope = new Compose(
  {
    fn() {
      return "Hello, world.";
    },
  },
  formulasGraph.scope
);

// Given the nature of ExplorableApp, these are integration tests.

describe("ExplorableApp", () => {
  it("keys include both real and virtual keys", async () => {
    assert.deepEqual(await ExplorableGraph.keys(formulasGraph), [
      "foo.txt",
      "greeting",
      "greeting = ƒ('world').js",
      "greeting = ƒ('world')",
      "obj",
      "obj = parse ƒ.json",
      "sample.txt",
      "sample.txt = ƒ().js",
      "sample.txt = ƒ()",
      "string",
      "string = ƒ.json",
      "value",
      "value = fn()",
    ]);
  });

  it("can return an object", async () => {
    const value = await formulasGraph.get("obj");
    assert.deepEqual(value, {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
  });

  it("can get the value of a virtual key", async () => {
    const s = await formulasGraph.get("string");
    assert.equal(s.trim(), `"Hello, world."`);
  });

  it("can produce a value using a function", async () => {
    const value = await formulasGraph.get("value");
    assert.equal(value, "Hello, world.");
  });

  it("can generate a value by calling a function exported by a module", async () => {
    const value = await formulasGraph.get("sample.txt");
    assert.equal(value, "Hello, world.");
  });

  it("can pass an argument to a function", async () => {
    const greeting = await formulasGraph.get("greeting");
    assert.equal(greeting, "Hello, world.");
  });

  it("Can navigate into a dynamic graph", async () => {
    const graph = new ExplorableApp(fixturesDirectory);
    const subgraph = await graph.get("subgraph");
    assert.deepEqual(await ExplorableGraph.keys(subgraph), ["a", "b"]);
    assert.equal(await subgraph.get("a"), "Hello, a.");
  });

  it.skip("composes explorable values with + values", async () => {
    const graph = new ExplorableApp(path.join(fixturesDirectory, "plusKeys"));
    const strings = await ExplorableGraph.strings(graph);
    assert.deepEqual(strings, {
      "+a": {
        "+sub": {
          plusSub1: "sub one",
        },
        plus1: "one",
        plus2: "two",
      },
      a: {
        sub: {
          aSub1: "sub 1",
          plusSub1: "sub one",
        },
        a1: "1",
        a2: "2",
        "+sub": {
          plusSub1: "sub one",
        },
        plus1: "one",
        plus2: "two",
      },
      b: "not explorable",
    });
  });
});
