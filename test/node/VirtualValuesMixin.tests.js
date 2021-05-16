import chai from "chai";
import path from "path";
import { fileURLToPath } from "url";
import WildcardKeysMixin from "../../src/common/WildcardKeysMixin.js";
import Files from "../../src/node/Files.js";
import VirtualValuesMixin from "../../src/node/VirtualValuesMixin.js";
const { assert } = chai;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const directory = path.join(fixturesDirectory, "virtualFiles");

class VirtualFiles extends VirtualValuesMixin(Files) {}
const virtualFiles = new VirtualFiles(directory);

describe("VirtualValuesMixin", () => {
  it("returns virtual names for virtual values", async () => {
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

  it("can export a scalar value", async () => {
    const value = await virtualFiles.get("math");
    assert.equal(value, 4);
  });

  it("can export a function", async () => {
    const fn = await virtualFiles.get("sample.txt");
    assert.equal(fn(), "Hello, world.");
  });

  it("copes with a request to get a key that doesn't exist even virtually", async () => {
    const value = await virtualFiles.get("doesn't exist");
    assert.isUndefined(value);
  });

  it.skip("passes a local graph to the arrow module's default function", async () => {
    const value = await virtualFiles.get("index.html");
    assert.equal(value, "<p>Hello, world.</p>");
  });

  it.skip("can return a result from a folder with a wildcard name", async () => {
    class WildcardGraph extends WildcardKeysMixin(VirtualFiles) {}
    const graph = new WildcardGraph(files);

    const value1 = await graph.get("subfolder", "virtual.txt");
    assert.equal(value1, "This text was returned for subfolder");

    const value2 = await graph.get("doesntexist", "virtual.txt");
    assert.equal(value2, "This text was returned for doesntexist");

    const value3 = await graph.get(":wildcard", "virtual.txt");
    assert.equal(value3, "This text was returned for :wildcard");
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
