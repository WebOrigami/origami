import { ObjectMap, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import ori_handler from "../../src/handlers/ori_handler.js";
import OrigamiFileMap from "../../src/runtime/OrigamiFileMap.js";

const fixturesUrl = new URL("fixtures", import.meta.url);
const fixtures = new OrigamiFileMap(fixturesUrl);

describe(".ori handler", async () => {
  test("loads a string expression", async () => {
    const source = `"Hello"`;
    const text = await ori_handler.unpack(source);
    assert.equal(text, "Hello");
  });

  test("loads a tree expression", async () => {
    const parent = new ObjectMap({
      name: "world",
    });
    const source = `{
      message = \`Hello, \${name}!\`
    }`;
    const tree = await ori_handler.unpack(source, { parent });
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
    const tree = await ori_handler.unpack(source);
    assert.deepEqual(
      await Tree.traverse(tree, "public", "message"),
      "Hello, world!"
    );
  });

  test("loads an object containing an object shorthand", async () => {
    const assets = new ObjectMap({});
    const parent = new ObjectMap({ assets });
    const source = `{ assets }`;
    const object = await ori_handler.unpack(source, { parent });
    assert.equal(object.assets, assets);
  });

  test("loads a template literal", async () => {
    const scope = new ObjectMap({
      name: "Alice",
    });
    const source = `\`Hello, \${name}!\``;
    const unpackedText = await ori_handler.unpack(source, {
      parent: scope,
    });
    assert.deepEqual(unpackedText, "Hello, Alice!");
  });

  test("loads a template lambda that reads from parent scope", async () => {
    const parent = new ObjectMap({
      name: "Alice",
    });
    const source = `() => \`Hello, \${name}!\``;
    const templateFn = await ori_handler.unpack(source, { parent });
    const value = await templateFn();
    assert.equal(value, "Hello, Alice!");
  });

  test("loads a template lambda that accepts input", async () => {
    const source = `(_) => \`Hello, \${ _.name }!\``;
    const templateFn = await ori_handler.unpack(source);
    const value = await templateFn({ name: "Alice" });
    assert.deepEqual(value, "Hello, Alice!");
  });

  test("loads a tree that includes a template", async () => {
    const source = await fixtures.get("site.ori");
    const tree = await ori_handler.unpack(source);
    const indexHtml = await tree["index.html"];
    assert.equal(indexHtml, "Hello, world!");
  });
});
