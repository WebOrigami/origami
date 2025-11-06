import { FileMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import js_handler from "../../src/handlers/js_handler.js";
import ImportModulesMixin from "../../src/runtime/ImportModulesMixin.js";

const fixturesUrl = new URL("fixtures", import.meta.url);
const fixturesTree = new (ImportModulesMixin(FileMap))(fixturesUrl);

describe(".js handler", () => {
  test("loads .js file that exports a string", async () => {
    const buffer = await fixturesTree.get("string.js");
    const text = await js_handler.unpack(buffer, {
      key: "string.js",
      parent: fixturesTree,
    });
    assert.equal(text, "This is a string.");
  });

  test("loads .js file that exports a function", async () => {
    const buffer = await fixturesTree.get("list.js");
    const list = await js_handler.unpack(buffer, {
      key: "list.js",
      parent: fixturesTree,
    });
    assert.equal(await list("a", "b", "c"), "a,b,c");
  });

  test("loads .js file that exports an object", async () => {
    const buffer = await fixturesTree.get("obj.js");
    const obj = await js_handler.unpack(buffer, {
      key: "obj.js",
      parent: fixturesTree,
    });
    assert.deepEqual(obj, { a: 1 });
  });

  test("returns multiple exports as an object", async () => {
    const buffer = await fixturesTree.get("multiple.js");
    const obj = await js_handler.unpack(buffer, {
      key: "multiple.js",
      parent: fixturesTree,
    });
    assert.deepEqual(obj, { n: 1, s: "string" });
  });
});
