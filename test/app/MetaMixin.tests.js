import path from "path";
import { fileURLToPath } from "url";
import { MetaMixin } from "../../exports.js";
import Compose from "../../src/common/Compose.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

const metaGraph = new (MetaMixin(ExplorableFiles))(
  path.join(fixturesDirectory, "meta")
);
metaGraph.scope = new Compose(
  {
    fn() {
      return "Hello, world.";
    },
  },
  metaGraph.scope
);

// Given the nature of MetaMixin, these are integration tests.

describe("MetaMixin", () => {
  it("keys include both real and virtual keys", async () => {
    assert.deepEqual(await ExplorableGraph.keys(metaGraph), [
      "foo.txt",
      "greeting",
      "greeting = this('world').js",
      "obj",
      "obj = this.json",
      "sample.txt",
      "sample.txt = this().js",
      "string",
      "string = this.json",
      "value",
      "value = fn()",
    ]);
  });

  it("can return an object", async () => {
    const value = await metaGraph.get("obj");
    assert.deepEqual(await ExplorableGraph.plain(value), {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
  });

  it("can get the value of a virtual key", async () => {
    const s = await metaGraph.get("string");
    assert.equal(s.trim(), `"Hello, world."`);
  });

  it("can produce a value using a function", async () => {
    const value = await metaGraph.get("value");
    assert.equal(value, "Hello, world.");
  });

  it("can generate a value by calling a function exported by a module", async () => {
    const value = await metaGraph.get("sample.txt");
    assert.equal(value, "Hello, world.");
  });

  it("can pass an argument to a function", async () => {
    const greeting = await metaGraph.get("greeting");
    assert.equal(greeting, "Hello, world.");
  });

  it("Can navigate into a dynamic graph", async () => {
    const graph = new (MetaMixin(ExplorableFiles))(fixturesDirectory);
    const subgraph = await graph.get("subgraph");
    assert.deepEqual(await ExplorableGraph.keys(subgraph), ["a", "b"]);
    assert.equal(await subgraph.get("a"), "Hello, a.");
  });

  it.skip("can handle nested wildcard folders", async () => {
    const graph = new (MetaMixin(ExplorableFiles))(
      path.join(fixturesDirectory, "wildcardFolders")
    );
    const indexHtml = await graph.get("2000", "01", "index.html");
    assert.equal(indexHtml, "Hello, world.\n");
  });
});
