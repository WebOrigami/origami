import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadOrigami from "../../src/loaders/ori2.js";

describe(".ori2 loader", () => {
  test("loads a string expression", async () => {
    const text = `"Hello"`;
    const origamiFile = await loadOrigami.call(null, text);
    const graph = await Graph.from(origamiFile);
    const defaultValue = await graph.get(Graph.defaultValueKey);
    assert.equal(defaultValue, "Hello");
  });

  test("loads a graph expression", async () => {
    const scope = new ObjectGraph({
      name: "world",
    });
    const text = `{
      message = \`Hello, {{ name }}!\`
    }`;
    const origamiFile = await loadOrigami.call(scope, text);
    assert.deepEqual(await Graph.plain(origamiFile), {
      message: "Hello, world!",
    });
  });

  test("loads a template literal", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `\`Hello, {{ name }}!\``;
    const origamiFile = await loadOrigami.call(scope, text);
    const graph = Graph.from(origamiFile);
    const value = await graph.get(Graph.defaultValueKey);
    assert.deepEqual(value, "Hello, Alice!");
  });

  test("loads a template lambda that reads from scope", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `=\`Hello, {{ name }}!\``;
    const origamiFile = await loadOrigami.call(scope, text);
    const templateFn = await origamiFile.contents();
    const value = await templateFn.call(scope);
    assert.equal(value, "Hello, Alice!");
  });

  test("loads a template lambda that accepts input", async () => {
    const text = `=\`Hello, {{ name }}!\``;
    const origamiFile = await loadOrigami.call(null, text);
    const templateFn = await origamiFile.contents();
    const value = await templateFn({ name: "Alice" });
    assert.deepEqual(value, "Hello, Alice!");
  });
});
