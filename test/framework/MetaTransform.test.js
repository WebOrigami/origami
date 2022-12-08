import path from "node:path";
import { fileURLToPath } from "node:url";
import builtins from "../../src/cli/builtins.js";
import MergeGraph from "../../src/common/MergeGraph.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import FilesGraph from "../../src/core/FilesGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import MetaTransform from "../../src/framework/MetaTransform.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

class MetaObject extends MetaTransform(ObjectGraph) {}

const metaGraph = new (MetaTransform(FilesGraph))(
  path.join(fixturesDirectory, "metagraphs")
);
metaGraph.parent = new MergeGraph(
  {
    fn() {
      return "Hello, world.";
    },
  },
  builtins
);

// Given the nature of MetaTransform, these are integration tests.

describe("MetaTransform", () => {
  it("keys include both real and virtual keys", async () => {
    assert.deepEqual(await ExplorableGraph.keys(metaGraph), [
      "foo.txt",
      "greeting",
      "obj",
      "sample.txt",
      "string",
      "value",
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
    assert.equal(s.toString().trim(), `"Hello, world."`);
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
    const graph = new (MetaTransform(FilesGraph))(fixturesDirectory);
    const subgraph = await graph.get("subgraph");
    assert.deepEqual(await ExplorableGraph.keys(subgraph), ["a", "b"]);
    assert.equal(await subgraph.get("a"), "Hello, a.");
  });

  it("has access to concrete values in scope", async () => {
    const graph = new MetaObject({
      greeting: "Hello",
      subgraph: {
        "message = greeting": "",
      },
    });
    assert.equal(
      await ExplorableGraph.traverse(graph, "subgraph", "message"),
      "Hello"
    );
  });

  it("has access to virtual values in scope", async () => {
    const graph = new MetaObject({
      "greeting = `Hello`": "",
      subgraph: {
        "message = greeting": "",
      },
    });
    assert.equal(await ExplorableGraph.traverse(graph, "greeting"), "Hello");
    assert.equal(
      await ExplorableGraph.traverse(graph, "subgraph", "message"),
      "Hello"
    );
  });
});
