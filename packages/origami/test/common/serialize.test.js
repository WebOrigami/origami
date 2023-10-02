import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as serialize from "../../src/common/serialize.js";

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
    assert.deepEqual(await Graph.plain(graph), {
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
    assert.deepEqual(await Graph.plain(graph), {
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
    const fn = Graph.toFunction(graph);
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
