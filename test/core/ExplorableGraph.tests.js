import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import assert from "../assert.js";

describe("ExplorableGraph", () => {
  it("from() converts input to an explorable graph", async () => {
    const graph1 = ExplorableGraph.from(`a: Hello, a.`);
    assert(await ExplorableGraph.plain(graph1), {
      a: "Hello, a.",
    });
    const graph2 = ExplorableGraph.from(graph1); // Already explorable
    assert.equal(graph2, graph1);
    const graph3 = ExplorableGraph.from({
      b: "Hello, b.",
    });
    assert.deepEqual(await ExplorableGraph.plain(graph3), {
      b: "Hello, b.",
    });
  });

  it("isExplorable() tests for explorable graph interface", async () => {
    assert(!ExplorableGraph.isExplorable({}));

    const missingIterator = {
      async get() {},
    };
    assert(!ExplorableGraph.isExplorable(missingIterator));

    const missingGet = {
      async *[Symbol.asyncIterator]() {},
    };
    assert(!ExplorableGraph.isExplorable(missingGet));

    const graph = {
      async *[Symbol.asyncIterator]() {},
      async get() {},
    };
    assert(ExplorableGraph.isExplorable(graph));
  });

  it("keys() returns an array of the graph's keys", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
    });
    assert.deepEqual(await ExplorableGraph.keys(graph), ["a", "b", "c"]);
  });

  it("map() returns a new explorable applying a mapping function", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const doubled = ExplorableGraph.map(graph, (value) => 2 * value);
    const plain = await ExplorableGraph.plain(doubled);
    assert.deepEqual(plain, {
      a: 2,
      b: 4,
      c: 6,
      more: {
        d: 8,
        e: 10,
      },
    });
  });

  it("parse() parses YAML (and so also JSON)", async () => {
    const text = `a: Hello, a.
b: Hello, b.
c: Hello, c.`;
    const graph = ExplorableGraph.parse(text);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
  });

  it("plain() produces a plain object version of a graph", async () => {
    const original = {
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    };
    const graph = new ExplorableObject(original);
    const plain = await ExplorableGraph.plain(graph);
    assert.deepEqual(plain, original);
  });

  it("strings() returns a graph with keys and values cast to strings", async () => {
    const graph = new ExplorableObject({
      a: 1,
      b: 2,
      c: 3,
      more: {
        d: 4,
        e: 5,
      },
    });
    const strings = await ExplorableGraph.strings(graph);
    assert.deepEqual(strings, {
      a: "1",
      b: "2",
      c: "3",
      more: {
        d: "4",
        e: "5",
      },
    });
  });

  it("toJson() renders a graph as JSON", async () => {
    const graph = new ExplorableObject({ a: "Hello, a." });
    const json = await ExplorableGraph.toJson(graph);
    assert.equal(json, `{\n  "a": "Hello, a."\n}`);
  });

  // it("toTextForExtension() renders a graph as JSON or YAML", async () => {
  //   const graph = new ExplorableObject({ a: "Hello, a." });
  //   const yaml = await ExplorableGraph.toTextForExtension(graph, "foo.yaml");
  //   assert.equal(yaml, `a: Hello, a.\n`);
  //   const json = await ExplorableGraph.toTextForExtension(graph, "foo.json");
  //   assert.equal(json, `{\n  "a": "Hello, a."\n}`);
  //   const text = await ExplorableGraph.toTextForExtension(graph, "foo.bar");
  //   assert.equal(text, `a: Hello, a.\n`); // YAML
  // });

  it("toYaml() renders a graph as YAML", async () => {
    const graph = new ExplorableObject({ a: "Hello, a." });
    const yaml = await ExplorableGraph.toYaml(graph);
    assert.equal(yaml, `a: Hello, a.\n`);
  });
});
