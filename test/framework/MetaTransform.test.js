import path from "node:path";
import { fileURLToPath } from "node:url";
import map from "../../src/builtins/map.js";
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

  it("inherits keys prefixed with `…`", async () => {
    const graph = new MetaObject({
      "…a": 1,
      sub: {
        "…b": 2,
        subsub: {
          "…b": 3, // Overrides ancestor value
        },
      },
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      sub: {
        a: 1,
        b: 2,
        subsub: {
          a: 1,
          b: 3,
        },
      },
    });
  });

  it("inherits formulas prefixed with `…`", async () => {
    const graph = new MetaObject({
      "…greeting = message": "",
      message: "Hello",
      spanish: {
        message: "Hola",
      },
    });
    assert.equal(await graph.get("greeting"), "Hello");
    const spanish = await graph.get("spanish");
    assert.equal(await spanish.get("greeting"), "Hola");
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

  it("a formula can reference a child addition", async () => {
    const graph = new MetaObject({
      "+": {
        "a.json": "Hello, a.",
      },
      "a.txt = a.json": "",
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      "a.json": "Hello, a.",
      "a.txt": "Hello, a.",
    });
  });

  it("a formula can define a child addition", async () => {
    const graph = new MetaObject({
      a: 1,
      "+ = this": {
        b: 2,
      },
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
    });
  });

  it("peer addition formulas can reference a local graph value", async () => {
    const fixture = new MetaObject({
      "sub+": {
        "message = `Hello, {{name}}.`": "",
      },
      sub: {
        name: "Alice",
      },
    });
    const sub = await fixture.get("sub");
    assert.equal(await sub.get("message"), "Hello, Alice.");
  });

  it("can inherit formulas prefixed with `…`", async () => {
    const graph = new MetaObject({
      "…greeting = message": "",
      message: "Hello",
      spanish: {
        message: "Hola",
      },
    });
    assert.equal(await graph.get("greeting"), "Hello");
    const spanish = await graph.get("spanish");
    assert.equal(await spanish.get("greeting"), "Hola");
  });

  it("can define inherited additions with formulas", async () => {
    const graph = new MetaObject({
      "…a = this": "inherited",
      folder: {
        b: "local",
      },
    });
    const folder = await graph.get("folder");
    assert.equal(await folder.get("a"), "inherited");
    assert.equal(await folder.get("b"), "local");
  });

  it("can define peer additions with a formula", async () => {
    const graph = new MetaObject({
      folder: {
        a: "local",
      },
      "folder+ = this": new ObjectGraph({ b: "peer" }),
    });
    const folder = await graph.get("folder");
    assert.equal(await folder.get("a"), "local");
    assert.equal(await folder.get("b"), "peer");
  });

  it("a child addition can have peer additions", async () => {
    const graph = new MetaObject({
      "+": {
        folder: {
          a: "local",
        },
        "folder+": {
          b: "peer",
        },
      },
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      folder: {
        a: "local",
        b: "peer",
      },
    });
  });

  it("can add peer additions to a map", async () => {
    const graph = new MetaObject({
      child: map({ a: 1 }, (x) => 2 * x),
      "child+": {
        b: 3,
      },
    });
    const child = await graph.get("child");
    assert.deepEqual(await ExplorableGraph.plain(child), {
      a: 2,
      b: 3,
    });
  });
});
