import { GraphHelpers, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadOrigami from "../../src/loaders/ori2.js";

describe.only(".ori2 loader", () => {
  test("loads a string expression", async () => {
    const text = `"Hello"`;
    const textWithGraph = await loadOrigami.call(null, text);
    assert.deepEqual(await GraphHelpers.plain(textWithGraph), {
      "": "Hello",
    });
  });

  test("loads a graph expression", async () => {
    const text = `{
      name = 'world'
      message = \`Hello, {{ name }}!\`
    }`;
    const textWithGraph = await loadOrigami.call(null, text);
    assert.deepEqual(await GraphHelpers.plain(textWithGraph), {
      name: "world",
      message: "Hello, world!",
    });
  });

  test("loads a template", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `\`Hello, {{ name }}!\``;
    const textWithGraph = await loadOrigami.call(scope, text);
    const graph = GraphHelpers.from(textWithGraph);
    const value = await graph.get("");
    assert.deepEqual(value, "Hello, Alice!");
  });

  test("loads a template lambda that reads from scope", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `=\`Hello, {{ name }}!\``;
    const textWithGraph = await loadOrigami.call(scope, text);
    const graph = GraphHelpers.from(textWithGraph);
    const value = await graph.get("");
    assert.deepEqual(value, "Hello, Alice!");
  });

  test("loads a template lambda that accepts input", async () => {
    const text = `=\`Hello, {{ name }}!\``;
    const textWithGraph = await loadOrigami.call(null, text);
    const graph = GraphHelpers.from(textWithGraph);
    const value = await graph.get({ name: "Alice" });
    assert.deepEqual(value, "Hello, Alice!");
  });
});
