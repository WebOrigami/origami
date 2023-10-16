import { ObjectTree, Tree } from "@graphorigami/core";
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

describe(".ori loader", () => {
  test("loads a string expression", async () => {
    const source = `"Hello"`;
    const text = await unpackOrigamiExpression(source);
    assert.equal(text, "Hello");
  });

  test("loads a tree expression", async () => {
    const scope = new ObjectTree({
      name: "world",
    });
    const source = `{
      message = \`Hello, {{ name }}!\`
    }`;
    const tree = await unpackOrigamiExpression(source, { parent: scope });
    assert.deepEqual(await Tree.plain(tree), {
      message: "Hello, world!",
    });
  });

  test("loads a tree with a nested tree", async () => {
    const source = `{
      name = "world",
      public = {
        message = \`Hello, {{ name }}!\`
      }
    }`;
    const tree = await unpackOrigamiExpression(source);
    assert.deepEqual(
      await Tree.traverse(tree, "public", "message"),
      "Hello, world!"
    );
  });

  test("loads a template literal", async () => {
    const scope = new ObjectTree({
      name: "Alice",
    });
    const source = `\`Hello, {{ name }}!\``;
    const unpackedText = await unpackOrigamiExpression(source, {
      parent: scope,
    });
    assert.deepEqual(unpackedText, "Hello, Alice!");
  });

  test("loads a template lambda that reads from scope", async () => {
    const scope = new ObjectTree({
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

  test("loads a tree that includes a template", async () => {
    const treeDocument = await fixtures.get("site.ori");
    const tree = await treeDocument.unpack();
    const indexHtml = await tree.get("index.html");
    assert.equal(indexHtml, "Hello, world!");
  });
});
