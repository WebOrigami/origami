import { FilesGraph, Graph } from "@graphorigami/core";
import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import ImportModulesMixin from "../../src/common/ImportModulesMixin.js";
import loadJs from "../../src/loaders/js.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const fixturesGraph = new (ImportModulesMixin(FilesGraph))(fixturesDirectory);

describe(".js loader", () => {
  test("loads .js file that exports a string", async () => {
    const buffer = await fixturesGraph.get("string.js");
    const moduleFile = await loadJs(fixturesGraph, buffer, "string.js");
    const contents = await moduleFile.contents();
    assert.equal(contents, "This is a string.");
  });

  test("loads .js file that exports a function", async () => {
    const buffer = await fixturesGraph.get("greet.js");
    const moduleFile = await loadJs(fixturesGraph, buffer, "greet.js");
    const greet = await moduleFile.contents();
    assert.equal(await greet("world"), "Hello, world!");
  });

  test("loads .js file that exports an object", async () => {
    const buffer = await fixturesGraph.get("obj.js");
    const moduleFile = await loadJs(fixturesGraph, buffer, "obj.js");
    const graph = await moduleFile.contents();
    assert.deepEqual(await Graph.plain(graph), { a: 1 });
  });
});
