import path from "path";
import { fileURLToPath } from "url";
import ExplorableApp from "../../src/app/ExplorableApp.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

const formulasGraph = new ExplorableApp(
  path.join(fixturesDirectory, "formulas")
);

// Given the nature of ExplorableApp, these are integration tests.

describe("ExplorableApp", () => {
  it("can return an object", async () => {
    const value = await formulasGraph.get("obj");
    assert.deepEqual(value, {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
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

  it("composes explorable values with + values", async () => {
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
