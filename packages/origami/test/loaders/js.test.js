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
    const text = await unpackModule(fixturesGraph, buffer, "string.js");
    assert.equal(text, "This is a string.");
  });

  test("loads .js file that exports a function", async () => {
    const buffer = await fixturesGraph.get("greet.js");
    const greet = await unpackModule(fixturesGraph, buffer, "greet.js");
    assert.equal(await greet("world"), "Hello, world!");
  });

  test("loads .js file that exports an object", async () => {
    const buffer = await fixturesGraph.get("obj.js");
    const obj = await unpackModule(fixturesGraph, buffer, "obj.js");
    assert.deepEqual(obj, { a: 1 });
  });
});
