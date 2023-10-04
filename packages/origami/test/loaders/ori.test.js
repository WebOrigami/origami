import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import unpackOrigamiExpression from "../../src/loaders/ori.js";

describe(".ori loader", () => {
  test("loads a string expression", async () => {
    const source = `"Hello"`;
    const text = await unpackOrigamiExpression(source);
    assert.equal(text, "Hello");
  });

  test("loads a graph expression", async () => {
    const scope = new ObjectGraph({
      name: "world",
    });
    const source = `{
      message = \`Hello, {{ name }}!\`
    }`;
    const graph = await unpackOrigamiExpression(source, { parent: scope });
    assert.deepEqual(await Graph.plain(graph), {
      message: "Hello, world!",
    });
  });

  test("loads a graph with a nested graph", async () => {
    const source = `{
      name = "world",
      public = {
        message = \`Hello, {{ name }}!\`
      }
    }`;
    const graph = await unpackOrigamiExpression(source);
    assert.deepEqual(
      await Graph.traverse(graph, "public", "message"),
      "Hello, world!"
    );
  });

  test("loads a template literal", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const source = `\`Hello, {{ name }}!\``;
    const unpackedText = await unpackOrigamiExpression(source, {
      parent: scope,
    });
    assert.deepEqual(unpackedText, "Hello, Alice!");
  });

  test("loads a template lambda that reads from scope", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const source = `=\`Hello, {{ name }}!\``;
    const templateFn = await unpackOrigamiExpression(source, { parent: scope });
    const value = await templateFn(scope);
    assert.equal(value, "Hello, Alice!");
  });

  test("loads a template lambda that accepts input", async () => {
    const source = `=\`Hello, {{ name }}!\``;
    const templateFn = await unpackOrigamiExpression(source);
    const value = await templateFn({ name: "Alice" });
    assert.deepEqual(value, "Hello, Alice!");
  });
});
