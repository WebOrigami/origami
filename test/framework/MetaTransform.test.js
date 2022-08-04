import path from "path";
import { fileURLToPath } from "url";
import builtins from "../../src/cli/builtins.js";
import Compose from "../../src/common/Compose.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import MetaTransform from "../../src/framework/MetaTransform.js";
import FilesGraph from "../../src/node/FilesGraph.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

const metaGraph = new (MetaTransform(FilesGraph))(
  path.join(fixturesDirectory, "metagraphs")
);
metaGraph.parent = new Compose(
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

  it("can inherit ellipsis formulas", async () => {
    const graph = new (MetaTransform(ObjectGraph))({
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
    const graph = new (MetaTransform(ObjectGraph))({
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
    const graph = new (MetaTransform(ObjectGraph))({
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
    const graph = new (MetaTransform(ObjectGraph))({
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
    const fixture = new (MetaTransform(ObjectGraph))({
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

  it("can imply keys based on additions", async () => {
    const graph = new (MetaTransform(ObjectGraph))({
      "+": {
        "a.json": "Hello, a.",
      },
      "[x].txt = {{x}}.json": "",
    });
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      "+": {
        "a.json": "Hello, a.",
      },
      "[x].txt = {{x}}.json": "",
      "a.json": "Hello, a.",
      "a.txt": "Hello, a.",
    });
  });

  it("real values take precedence over wildcards", async () => {
    const graph = new (MetaTransform(ObjectGraph))({
      "…a": 1,
      subgraphWithA: {
        a: 2,
      },
      subgraphWithoutA: {},
    });

    assert.equal(
      await ExplorableGraph.traverse(graph, "subgraphWithA", "a"),
      2
    );
    assert.equal(
      await ExplorableGraph.traverse(graph, "subgraphWithoutA", "a"),
      1
    );
  });

  it("wildcard values do not apply in scope", async () => {
    const graph = new (MetaTransform(ObjectGraph))({
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

  it("lets subgraphs inherit values", async () => {
    const fixture = new (MetaTransform(ObjectGraph))({
      "…a": 1,
      "…b": 2,
      subgraph: {
        "…b": 3, // Overrides ancestor value
        subsubgraph: {},
      },
    });

    assert.equal(await fixture.get("a"), 1);

    assert.equal(await ExplorableGraph.traverse(fixture, "subgraph", "a"), 1);
    assert.equal(await ExplorableGraph.traverse(fixture, "subgraph", "b"), 3);

    assert.equal(
      await ExplorableGraph.traverse(fixture, "subgraph", "subsubgraph", "a"),
      1
    );
    assert.equal(
      await ExplorableGraph.traverse(fixture, "subgraph", "subsubgraph", "b"),
      3
    );
  });

  it("ghost folders can define formulas that work on original graph values", async () => {
    const fixture = new (MetaTransform(ObjectGraph))({
      "[x]+": {
        "message = `Hello, {{name}}.`": "",
      },
      sub: {
        name: "Alice",
      },
    });
    assert.equal(
      await ExplorableGraph.traverse(fixture, "sub", "message"),
      "Hello, Alice."
    );
  });
});
