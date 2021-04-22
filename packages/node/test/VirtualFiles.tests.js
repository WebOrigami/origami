import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import VirtualFiles from "../src/VirtualFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const directory = path.join(fixturesDirectory, "virtual");
// @ts-ignore Until we can declare mixins.
const virtualFiles = new VirtualFiles(directory);

describe("VirtualFiles", () => {
  it("Can generate a file from an arrow module", async () => {
    const keys = await virtualFiles.keys();
    assert.deepEqual(keys, [
      ":wildcard",
      "graph.js",
      "index.html",
      "index.txt",
      "math",
      "sample.txt",
      "subfolder",
    ]);
    const result = await virtualFiles.get("sample.txt");
    assert.equal(result, "Hello, world.");
  });

  it("Can export a scalar value", async () => {
    const result = await virtualFiles.get("math");
    assert.equal(result, 4);
  });

  it("Passes a local graph to the arrow module's default function", async () => {
    const result = await virtualFiles.get("index.html");
    assert.equal(result, "<p>Hello, world.</p>");
  });

  it("Can identify a wildcard folder", async () => {
    /** @type {any} */ const wildcardFolder = await virtualFiles.wildcardFolder();
    assert(wildcardFolder);
    const basename = path.basename(wildcardFolder.dirname);
    assert.equal(basename, ":wildcard");
    const keys = await wildcardFolder.keys();
    assert.deepEqual(keys, ["foo.txt"]);
  });

  it("Includes wildcard folder contents in keys", async () => {
    const subfolder = await virtualFiles.get("subfolder");
    const keys = await subfolder.keys();
    assert.deepEqual(keys, ["bar.txt", "foo.txt"]);
  });

  it("Can return a result from a folder with a wildcard name", async () => {
    const result = await virtualFiles.get("doesntexist", "foo.txt");
    assert.equal(result, "doesntexist");
  });
});
