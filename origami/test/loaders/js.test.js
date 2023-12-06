import { FileTree } from "@weborigami/async-tree";
import { ImportModulesMixin } from "@weborigami/language";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import unpackModule from "../../src/builtins/@loaders/js.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const fixturesTree = new (ImportModulesMixin(FileTree))(fixturesDirectory);

describe(".js loader", () => {
  test("loads .js file that exports a string", async () => {
    const buffer = await fixturesTree.get("string.js");
    const text = await unpackModule(buffer, {
      key: "string.js",
      parent: fixturesTree,
    });
    assert.equal(text, "This is a string.");
  });

  test("loads .js file that exports a function", async () => {
    const buffer = await fixturesTree.get("list.js");
    const list = await unpackModule(buffer, {
      key: "list.js",
      parent: fixturesTree,
    });
    assert.equal(await list("a", "b", "c"), "a,b,c");
  });

  test("loads .js file that exports an object", async () => {
    const buffer = await fixturesTree.get("obj.js");
    const obj = await unpackModule(buffer, {
      key: "obj.js",
      parent: fixturesTree,
    });
    assert.deepEqual(obj, { a: 1 });
  });
});
