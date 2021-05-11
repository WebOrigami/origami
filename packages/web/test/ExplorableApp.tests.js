import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import ExplorableApp from "../src/ExplorableApp.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

// Given the nature of ExplorableApp, these are integration tests.

describe("ExplorableApp", () => {
  it("Can navigate into a dynamic graph", async () => {
    const graph = new ExplorableApp(fixturesDirectory);
    const subgraph = await graph.get("subgraph");
    assert.deepEqual(await subgraph.keys(), ["a", "b"]);
    assert.equal(await subgraph.get("a"), "Hello, a.");
  });
});
