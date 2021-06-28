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
  it.skip("Can navigate into a dynamic graph", async () => {
    const graph = new ExplorableApp(fixturesDirectory);
    const subgraph = await graph.get("subgraph");
    assert.deepEqual(await ExplorableGraph.keys(subgraph), ["a", "b"]);
    assert.equal(await subgraph.get("a"), "Hello, a.");
  });

  it("can generate a value by calling a function exported by a module", async () => {
    const value = await formulasGraph.get("sample.txt");
    assert.equal(value, "Hello, world.");
  });

  it.skip("can return an explorable object", async () => {
    const value = await formulasGraph.get("obj");
    // TODO: This fails because the obj is a plain object, not explorable.
    assert(ExplorableGraph.isExplorable(value));
    assert.deepEqual(await ExplorableGraph.plain(value), {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
    assert.equal(await formulasGraph.get("sampleJson", "a"), "Hello, a.");
  });
});
