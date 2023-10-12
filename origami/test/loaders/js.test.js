import { FilesGraph } from "@graphorigami/core";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import ImportModulesMixin from "../../src/common/ImportModulesMixin.js";
import unpackModule from "../../src/loaders/js.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const fixturesGraph = new (ImportModulesMixin(FilesGraph))(fixturesDirectory);

describe(".js loader", () => {
  test("loads .js file that exports a string", async () => {
    const buffer = await fixturesGraph.get("string.js");
    const text = await unpackModule(buffer, {
      key: "string.js",
      parent: fixturesGraph,
    });
    assert.equal(text, "This is a string.");
  });

  test("loads .js file that exports a function", async () => {
    const buffer = await fixturesGraph.get("list.js");
    const list = await unpackModule(buffer, {
      key: "list.js",
      parent: fixturesGraph,
    });
    assert.equal(await list("a", "b", "c"), "a,b,c");
  });

  test("loads .js file that exports an object", async () => {
    const buffer = await fixturesGraph.get("obj.js");
    const obj = await unpackModule(buffer, {
      key: "obj.js",
      parent: fixturesGraph,
    });
    assert.deepEqual(obj, { a: 1 });
  });
});
