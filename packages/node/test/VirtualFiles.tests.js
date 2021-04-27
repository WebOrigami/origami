import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import Files from "../src/Files.js";
import VirtualFiles from "../src/VirtualFiles.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const directory = path.join(fixturesDirectory, "virtual");
const files = new Files(directory);
const virtualFiles = new VirtualFiles(files);

describe.only("VirtualFiles", () => {
  it("Returns virtual names for virtual files", async () => {
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
  });

  it("Can virtual file contents", async () => {
    const result = await virtualFiles.get("sample.txt");
    assert.equal(result, "Hello, world.");
  });

  it("Copes with a request to get a key that doesn't exist even virtually", async () => {
    const result = await virtualFiles.get("doesn't exist");
    assert.isUndefined(result);
  });

  it("Can export a scalar value", async () => {
    const result = await virtualFiles.get("math");
    assert.equal(result, 4);
  });

  it("Passes a local graph to the arrow module's default function", async () => {
    const result = await virtualFiles.get("index.html");
    assert.equal(result, "<p>Hello, world.</p>");
  });

  it.skip("Can return a result from a folder with a wildcard name", async () => {
    const result1 = await virtualFiles.get("subfolder", "virtual.txt");
    assert.equal(result1, "This file was returned for subfolder");

    const result2 = await virtualFiles.get("doesntexist", "virtual.txt");
    assert.equal(result2, "This file was returned for doesntexist");
  });

  // it("can inspect the structure of a tree with virtual files", async () => {
  //   const structure = await virtualFiles.structure();
  //   assert.deepEqual(structure, {
  //     ":wildcard": {
  //       "bar.txt": null,
  //       "virtual.txt←.js": null,
  //     },
  //     "graph.js": null,
  //     "index.html": null,
  //     "index.txt": null,
  //     math: null,
  //     "sample.txt": null,
  //     subfolder: {
  //       "bar.txt": null,
  //       "foo.txt": null,
  //       "virtual.txt": null,
  //     },
  //   });
  // });
});
