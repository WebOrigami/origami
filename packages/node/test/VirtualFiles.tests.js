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
    assert.deepEqual(keys, ["bar.txt", "foo.txt", "virtual.txt"]);
  });

  it("Can return a result from a folder with a wildcard name", async () => {
    const result1 = await virtualFiles.get("subfolder", "virtual.txt");
    assert.equal(result1, "This file was returned for subfolder");

    const result2 = await virtualFiles.get("doesntexist", "virtual.txt");
    assert.equal(result2, "This file was returned for doesntexist");
  });

  it("Unbound wildcard folder returns files as is", async () => {
    const wildcardFolder = await virtualFiles.get(":wildcard");
    assert.deepEqual(await wildcardFolder.keys(), [
      "bar.txt",
      "virtual.txt←.js",
    ]);
  });

  it("can inspect the structure of a tree with virtual files", async () => {
    const structure = await virtualFiles.structure();
    assert.deepEqual(structure, {
      ":wildcard": {
        "bar.txt": null,
        "virtual.txt←.js": null,
      },
      "graph.js": null,
      "index.html": null,
      "index.txt": null,
      math: null,
      "sample.txt": null,
      subfolder: {
        "bar.txt": null,
        "foo.txt": null,
        "virtual.txt": null,
      },
    });
  });
});
