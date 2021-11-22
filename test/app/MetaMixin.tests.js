import path from "path";
import { fileURLToPath } from "url";
import MetaMixin from "../../src/app/MetaMixin.js";
import Compose from "../../src/common/Compose.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import builtins from "../../src/eg/builtins.js";
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
  builtins
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
    const indexHtml = await ExplorableGraph.traverse(
      graph,
      "2000",
      "01",
      "index.html"
    );
    assert.equal(indexHtml, "Hello, world.\n");
  });

  it("can inherit formulas", async () => {
    const graph = new (MetaMixin(ExplorableObject))({
      "greeting = message": "",
      message: "Hello",
      spanish: {
        message: "Hola",
      },
    });
    assert.equal(await graph.get("greeting"), "Hello");
    const spanish = await graph.get("spanish");
    assert.equal(await spanish.get("greeting"), "Hola");
  });

  it("can inherit functions", async () => {
    const graph = new (MetaMixin(ExplorableObject))({
      "index.txt": "Home",
      textToHtml: (text) => `<body>${text}</body>`,
      "{x}.html = textToHtml(${x}.txt)": "",
      about: {
        "index.txt": "About",
      },
    });
    assert.equal(await graph.get("index.html"), "<body>Home</body>");
    const about = await graph.get("about");
    assert.equal(await about.get("index.html"), "<body>About</body>");
  });

  it("can imply keys based on additions", async () => {
    const graph = new (MetaMixin(ExplorableObject))({
      "+": {
        "a.json": "Hello, a.",
      },
      "{x}.txt = ${x}.json": "",
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      "+": {
        "a.json": "Hello, a.",
      },
      "{x}.txt = ${x}.json": "",
      "a.json": "Hello, a.",
      "a.txt": "Hello, a.",
    });
  });

  it("doesn't inherit wildcard folders", async () => {
    const graph = new (MetaMixin(ExplorableObject))({
      "{test}": {
        b: 2,
      },
      a: 1,
      subgraph: {},
    });
    // Wildcard folder matches direct request.
    const foo = await graph.get("foo");
    assert.deepEqual(await ExplorableGraph.plain(foo), { b: 2 });
    // Regular values are inherited.
    assert.equal(await ExplorableGraph.traverse(graph, "subgraph", "a"), 1);
    // Wildcard values are not inherited.
    assert.equal(
      await ExplorableGraph.traverse(graph, "subgraph", "b"),
      undefined
    );
  });
});
