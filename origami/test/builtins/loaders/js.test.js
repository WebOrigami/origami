import { FileTree } from "@weborigami/async-tree";
import { ImportModulesMixin } from "@weborigami/language";
import assert from "node:assert";
import { describe, test } from "node:test";
import fileTypeJs from "../../../src/builtins/@loaders/js.js";

const fixturesUrl = new URL("fixtures", import.meta.url);
const fixturesTree = new (ImportModulesMixin(FileTree))(fixturesUrl);

describe(".js loader", () => {
  test("loads .js file that exports a string", async () => {
    const buffer = await fixturesTree.get("string.js");
    const text = await fileTypeJs.unpack(buffer, {
      key: "string.js",
      parent: fixturesTree,
    });
    assert.equal(text, "This is a string.");
  });

  test("loads .js file that exports a function", async () => {
    const buffer = await fixturesTree.get("list.js");
    const list = await fileTypeJs.unpack(buffer, {
      key: "list.js",
      parent: fixturesTree,
    });
    assert.equal(await list("a", "b", "c"), "a,b,c");
  });

  test("loads .js file that exports an object", async () => {
    const buffer = await fixturesTree.get("obj.js");
    const obj = await fileTypeJs.unpack(buffer, {
      key: "obj.js",
      parent: fixturesTree,
    });
    assert.deepEqual(obj, { a: 1 });
  });
});
