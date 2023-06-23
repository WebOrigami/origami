import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import FilesGraph from "../../src/core/FilesGraph.js";
import ImportModulesMixin from "../../src/framework/ImportModulesMixin.js";
import loadJs from "../../src/loaders/js.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const fixturesGraph = new (ImportModulesMixin(FilesGraph))(fixturesDirectory);

describe(".js loader", () => {
  test("interprets .js files as a function", async () => {
    const buffer = await fixturesGraph.get("greet.js");
    const greetFile = await loadJs.call(fixturesGraph, buffer, "greet.js");
    const greet = greetFile.toFunction();
    assert.equal(await greet("world"), "Hello, world!");
  });

  test("interprets .js files as a graph", async () => {
    const buffer = await fixturesGraph.get("obj.js");
    const greetFile = await loadJs.call(fixturesGraph, buffer, "obj.js");
    const graph = greetFile.toGraph();
    assert.deepEqual(await ExplorableGraph.plain(graph), { a: 1 });
  });
});
