import { ObjectTree, Tree } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import { builtinsTree, oriHandler } from "../../src/internal.js";

const fixturesUrl = new URL("fixtures", import.meta.url);
const fixtures = new OrigamiFiles(fixturesUrl);
fixtures.parent = builtinsTree;

describe(".ori handler", () => {
  test("loads a string expression", async () => {
    const source = `"Hello"`;
    const text = await oriHandler.unpack(source);
    assert.equal(text, "Hello");
  });

  test("loads a tree expression", async () => {
    const parent = new ObjectTree({
      name: "world",
    });
    const source = `{
      message = \`Hello, \${name}!\`
    }`;
    const tree = await oriHandler.unpack(source, { parent });
    assert.deepEqual(await Tree.plain(tree), {
      message: "Hello, world!",
    });
    assert.equal(await tree.message, "Hello, world!");
  });

  test("loads a tree with a nested tree", async () => {
    const source = `{
      name = "world",
      public = {
        message = \`Hello, \${name}!\`
      }
    }`;
    const tree = await oriHandler.unpack(source);
    assert.deepEqual(
      await Tree.traverse(tree, "public", "message"),
      "Hello, world!"
    );
  });

  test("loads an object containing an object shorthand", async () => {
    const assets = new ObjectTree({});
    const parent = new ObjectTree({ assets });
    const source = `{ assets }`;
    const object = await oriHandler.unpack(source, { parent });
    assert.equal(object.assets, assets);
  });

  test("loads a template literal", async () => {
    const scope = new ObjectTree({
      name: "Alice",
    });
    const source = `\`Hello, \${name}!\``;
    const unpackedText = await oriHandler.unpack(source, {
      parent: scope,
    });
    assert.deepEqual(unpackedText, "Hello, Alice!");
  });

  test("loads a template lambda that reads from parent scope", async () => {
    const parent = new ObjectTree({
      name: "Alice",
    });
    const source = `=\`Hello, \${name}!\``;
    const templateFn = await oriHandler.unpack(source, { parent });
    const value = await templateFn();
    assert.equal(value, "Hello, Alice!");
  });

  test("loads a template lambda that accepts input", async () => {
    const source = `=\`Hello, \${ _/name }!\``;
    const templateFn = await oriHandler.unpack(source);
    const value = await templateFn({ name: "Alice" });
    assert.deepEqual(value, "Hello, Alice!");
  });

  test("loads a tree that includes a template", async () => {
    const treeDocument = await fixtures.get("site.ori");
    const tree = await treeDocument.unpack();
    const indexHtml = await tree["index.html"];
    assert.equal(indexHtml, "Hello, world!");
  });
});
