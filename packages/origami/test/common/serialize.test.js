import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as serialize from "../../src/common/serialize.js";

describe("serialize", () => {
  test("parseYaml() can parse YAML text", async () => {
    const yaml = `a: Hello, a.
b: Hello, b.
c: Hello, c.`;
    const data = serialize.parseYaml(yaml);
    assert.deepEqual(data, {
      a: "Hello, a.",
      b: "Hello, b.",
      c: "Hello, c.",
    });
  });

  test("parseYaml() can parse YAML text with expressions", async () => {
    const yaml = `a: 1
b: !ori a`;
    const graph = serialize.parseYaml(yaml);
    // @ts-ignore
    assert.deepEqual(await Graph.plain(graph), {
      a: 1,
      b: 1,
    });
  });

  test("toJson() renders a graph as JSON", async () => {
    const graph = new ObjectGraph({ a: "Hello, a." });
    const json = await serialize.toJson(graph);
    assert.equal(json, `{\n  "a": "Hello, a."\n}`);
  });

  test("toJsonValue() invokes an object's serialize() method", async () => {
    const obj = {
      async serialize() {
        return 1;
      },
    };
    const value = await serialize.toJsonValue(obj);
    assert.deepEqual(value, 1);
  });

  test("toJsonValue() can map a graph to a plain object", async () => {
    const graph = new ObjectGraph({ a: "Hello, a." });
    const value = await serialize.toJsonValue(graph);
    assert.deepEqual(value, { a: "Hello, a." });
  });

  test("toYaml() renders a graph as YAML", async () => {
    const graph = new ObjectGraph({ a: "Hello, a." });
    const yaml = await serialize.toYaml(graph);
    assert.equal(yaml, `a: Hello, a.\n`);
  });
});
