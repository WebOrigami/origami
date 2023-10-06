import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import OrigamiFiles from "../../src/framework/OrigamiFiles.js";
import unpackOrigamiExpression from "../../src/loaders/ori.js";

const dirname = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures"
);
const fixtures = new OrigamiFiles(dirname);

describe.only(".ori loader", () => {
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
    const templateFn = await unpackOrigamiExpression(source);
    const value = await templateFn.call(scope);
    assert.equal(value, "Hello, Alice!");
  });

  test("loads a template lambda that accepts input", async () => {
    const source = `=\`Hello, {{ _/name }}!\``;
    const templateFn = await unpackOrigamiExpression(source);
    const value = await templateFn({ name: "Alice" });
    assert.deepEqual(value, "Hello, Alice!");
  });

  test.only("loads a graph that includes a template", async () => {
    const graphDocument = await fixtures.get("site.ori");
    const graph = await graphDocument.unpack();
    const indexHtml = await graph.get("index.html");
    assert.equal(indexHtml, "Hello, world!");
  });
});
