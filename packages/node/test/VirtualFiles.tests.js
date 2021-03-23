import { asyncGet, asyncOps } from "@explorablegraph/core";
import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import VirtualFiles from "../src/VirtualFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const directory = path.join(fixturesDirectory, "virtual");
const virtualFiles = new VirtualFiles(directory);

describe("VirtualFiles", () => {
  it("Can generate a file from an arrow module", async () => {
    const keys = await asyncOps.keys(virtualFiles);
    assert.deepEqual(keys, [
      "graph.js",
      "index.html",
      "index.txt",
      "math",
      "sample.txt",
    ]);
    const result = await virtualFiles[asyncGet]("sample.txt");
    assert.equal(result, "Hello, world.");
  });

  it("Can export a scalar value", async () => {
    const result = await virtualFiles[asyncGet]("math");
    assert.equal(result, 4);
  });

  it("Passes a local graph to the arrow module's default function", async () => {
    const result = await virtualFiles[asyncGet]("index.html");
    assert.equal(result, "<p>Hello, world.</p>");
  });
});
