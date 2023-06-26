import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import * as serialize from "../../src/core/serialize.js";

describe("serialize", () => {
  test("extractFrontMatter() returns front matter if found", () => {
    const text = serialize.extractFrontMatter(`---
a: Hello, a.
---
This is the content.
`);
    assert.deepEqual(text, {
      frontText: "a: Hello, a.\n",
      frontBlock: "---\na: Hello, a.\n---\n",
      bodyText: "This is the content.\n",
      frontData: {
        a: "Hello, a.",
      },
    });
  });

  test("extractFrontMatter returns body text if no front matter is found", () => {
    const text = "a: Hello, a.";
    const { bodyText, frontData } = serialize.extractFrontMatter(text);
    assert.equal(frontData, null);
    assert.equal(bodyText, text);
  });

  test("fromJson() can parse JSON text", async () => {
    const yaml = `{"a": 1, "b": 2, "c": 3}`;
    const graph = serialize.fromJson(yaml);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: 1,
      b: 2,
      c: 3,
    });
  });

  test("fromYaml() can parse YAML text", async () => {
    const yaml = `a: Hello, a.
b: Hello, b.
c: Hello, c.`;
    const graph = serialize.fromYaml(yaml);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
  });

  test("toFunction() returns the graph in function form", async () => {
    const graph = new ObjectGraph({
      a: 1,
      b: 2,
      c: 3,
    });
    const fn = ExplorableGraph.toFunction(graph);
    assert.equal(await fn("a"), 1);
  });

  test("parse can combine front matter and body text", () => {
    const parsed = serialize.parseYaml(`---
a: Hello, a.
---
This is the content.
`);
    assert.deepEqual(parsed, {
      a: "Hello, a.",
      "@text": "This is the content.\n",
    });
  });

  test("outputFrontMatter writes output as text if there's no graph", async () => {
    const text = "This is the content.";
    const output = await serialize.outputWithGraph(text);
    assert.equal(output, text);
  });

  test("outputFrontMatter adds graph to output", async () => {
    const text = "This is the content.";
    const graph = new ObjectGraph({ a: "Hello, a." });
    const output = await serialize.outputWithGraph(text, graph);
    assert.equal(String(output), text);
    const outputGraph = /** @type {any} */ (output).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(outputGraph), {
      a: "Hello, a.",
    });
  });

  test("outputFrontMatter can include front matter", async () => {
    const text = "This is the content.";
    const graph = new ObjectGraph({ a: "Hello, a." });
    const output = await serialize.outputWithGraph(text, graph, true);
    assert.equal(
      output,
      `---
a: Hello, a.
---
This is the content.`
    );
    const outputGraph = /** @type {any} */ (output).toGraph();
    assert.deepEqual(await ExplorableGraph.plain(outputGraph), {
      a: "Hello, a.",
    });
  });

  test("toJson() renders a graph as JSON", async () => {
    const graph = new ObjectGraph({ a: "Hello, a." });
    const json = await serialize.toJson(graph);
    assert.equal(json, `{\n  "a": "Hello, a."\n}`);
  });

  test("toYaml() renders a graph as YAML", async () => {
    const graph = new ObjectGraph({ a: "Hello, a." });
    const yaml = await serialize.toYaml(graph);
    assert.equal(yaml, `a: Hello, a.\n`);
  });
});
