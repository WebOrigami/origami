import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import loadOrigamiExpression from "../../src/loaders/ori.js";

describe(".ori loader", () => {
  test("loads a string expression", async () => {
    const text = `"Hello"`;
    const origamiFile = await loadOrigamiExpression(null, text);
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
    const origamiFile = await loadOrigamiExpression(scope, text);
    assert.deepEqual(await Graph.plain(origamiFile), {
      message: "Hello, world!",
    });
  });

  test("loads a graph with a nested graph", async () => {
    const text = `{
      name = "world",
      public = {
        message = \`Hello, {{ name }}!\`
      }
    }`;
    const origamiFile = await loadOrigamiExpression(null, text);
    assert.deepEqual(
      await Graph.traverse(origamiFile, "public", "message"),
      "Hello, world!"
    );
  });

  test("loads a template literal", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `\`Hello, {{ name }}!\``;
    const origamiFile = await loadOrigamiExpression(scope, text);
    const graph = Graph.from(origamiFile);
    const value = await graph.get(Graph.defaultValueKey);
    assert.deepEqual(value, "Hello, Alice!");
  });

  test("loads a template lambda that reads from scope", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `=\`Hello, {{ name }}!\``;
    const origamiFile = await loadOrigamiExpression(scope, text);
    const templateFn = await origamiFile.contents();
    const value = await templateFn(scope);
    assert.equal(value, "Hello, Alice!");
  });

  test("loads a template lambda that accepts input", async () => {
    const text = `=\`Hello, {{ name }}!\``;
    const origamiFile = await loadOrigamiExpression(null, text);
    const templateFn = await origamiFile.contents();
    const value = await templateFn({ name: "Alice" });
    assert.deepEqual(value, "Hello, Alice!");
  });
});
