import { ObjectTree, Tree } from "@weborigami/async-tree";
import { OrigamiFiles, Scope } from "@weborigami/language";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import builtins from "../../src/builtins/@builtins.js";
import unpackOrigamiExpression from "../../src/builtins/@loaders/ori.js";

const dirname = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures"
);
const fixtures = Scope.treeWithScope(new OrigamiFiles(dirname), builtins);

describe(".ori loader", () => {
  test("loads a string expression", async () => {
    const source = `"Hello"`;
    const text = await unpackOrigamiExpression(source);
    assert.equal(text, "Hello");
  });

  test("loads a tree expression", async () => {
    const parent = new ObjectTree({
      name: "world",
    });
    const source = `{
      message = \`Hello, {{ name }}!\`
    }`;
    const tree = await unpackOrigamiExpression(source, { parent });
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

  test("loads an object containing an object shorthand", async () => {
    const assets = new ObjectTree({});
    const parent = new ObjectTree({ assets });
    const source = `{ assets }`;
    const object = await unpackOrigamiExpression(source, { parent });
    assert.equal(object.assets, assets);
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

  test("loads a template lambda that reads from parent scope", async () => {
    const parent = new ObjectTree({
      name: "Alice",
    });
    const source = `=\`Hello, {{ name }}!\``;
    const templateFn = await unpackOrigamiExpression(source, { parent });
    const value = await templateFn();
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
