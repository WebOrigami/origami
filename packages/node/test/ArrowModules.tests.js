import { asyncGet, asyncOps } from "@explorablegraph/core";
import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import ArrowModules from "../src/ArrowModules.js";
import JavaScriptModuleFiles from "../src/JavaScriptModuleFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const directory = path.join(fixturesDirectory, "arrow");
const modules = new JavaScriptModuleFiles(directory);
const arrowModules = new ArrowModules(modules);

describe("ArrowModules", () => {
  it("Can generate a file from an arrow module", async () => {
    const keys = await asyncOps.keys(arrowModules);
    assert.deepEqual(keys, [
      "graph.js",
      "index.html",
      "index.txt",
      "math",
      "sample.txt",
    ]);
    const result = await arrowModules[asyncGet]("sample.txt");
    assert.equal(result, "Hello, world.");
  });

  it("Can export a scalar value", async () => {
    const result = await arrowModules[asyncGet]("math");
    assert.equal(result, 4);
  });

  it("Passes a local graph to the arrow module's default function", async () => {
    const result = await arrowModules[asyncGet]("index.html");
    assert.equal(result, "<p>Hello, world.</p>");
  });
});
