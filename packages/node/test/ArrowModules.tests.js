import { asyncGet, asyncOps } from "@explorablegraph/core";
import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import ArrowModules from "../src/ArrowModules.js";
import JavaScriptModuleFiles from "../src/JavaScriptModuleFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");

describe("ArrowModules", () => {
  it("Can generate a file from an arrow module", async () => {
    const directory = path.join(fixturesDirectory, "arrow");
    const modules = new JavaScriptModuleFiles(directory);
    const arrowModules = new ArrowModules(modules);
    const keys = await asyncOps.keys(arrowModules);
    assert.deepEqual(keys, [
      "graph.js",
      "index.html",
      "index.txt",
      "sample.txt",
    ]);
    const result = await arrowModules[asyncGet]("sample.txt");
    assert.equal(result, "Hello, world.");
  });

  it("Passes a local graph to the arrow module's default function", async () => {
    const directory = path.join(fixturesDirectory, "arrow");
    const modules = new JavaScriptModuleFiles(directory);
    const arrowModules = new ArrowModules(modules);
    const result = await arrowModules[asyncGet]("index.html");
    assert.equal(result, "<p>Hello, world.</p>");
  });
});
