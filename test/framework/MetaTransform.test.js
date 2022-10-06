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

  it("can handle nested wildcard folders", async () => {
    const graph = new (MetaTransform(FilesGraph))(
      path.join(fixturesDirectory, "wildcardFolders")
    );
    const indexHtml = await ExplorableGraph.traverse(
      graph,
      "2000",
      "01",
      "index.html"
    );
    const normalized = indexHtml?.toString().replace(/\r\n/g, "\n");
    assert.equal(normalized, "Hello, world.\n");
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

  it("can inherit functions", async () => {
    const graph = new MetaObject({
      "index.txt": "Home",
      textToHtml: (text) => `<body>${text}</body>`,
      "…[x].html = textToHtml({{x}}.txt)": "",
      about: {
        "index.txt": "About",
      },
    });
    assert.equal(await graph.get("index.html"), "<body>Home</body>");
    const about = await graph.get("about");
    assert.equal(await about.get("index.html"), "<body>About</body>");
  });

  it("can inherit bound variables", async () => {
    const fixture = new MetaObject({
      "[x]": {
        "[y] = `{{x}}{{y}}`": "",
      },
    });
    assert.equal(
      await ExplorableGraph.traverse(fixture, "foo", "bar"),
      "foobar"
    );
    assert.equal(
      await ExplorableGraph.traverse(fixture, "fizz", "buzz"),
      "fizzbuzz"
    );
  });

  it("a formula can reference a child addition", async () => {
    const graph = new MetaObject({
      "+": {
        "a.json": "Hello, a.",
      },
      "[x].txt = {{x}}.json": "",
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      "a.json": "Hello, a.",
      "a.txt": "Hello, a.",
    });
  });

  it("wildcard values do not apply in scope", async () => {
    const graph = new MetaObject({
      "[test]": {
        a: 1,
      },
      subgraph: {
        "match = foo": "",
      },
    });

    // Wildcard folder matches direct request.
    const foo = await graph.get("foo");
    assert.deepEqual(await ExplorableGraph.plain(foo), { a: 1 });

    // Wildcard folder is not found in search of scope.
    const match = await ExplorableGraph.traverse(graph, "subgraph", "match");
    assert.equal(match, undefined);
  });

  it("peer addition formulas can reference a local graph value", async () => {
    const fixture = new MetaObject({
      "[x]+": {
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
});
