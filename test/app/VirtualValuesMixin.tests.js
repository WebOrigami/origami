import path from "path";
import { fileURLToPath } from "url";
import VirtualValuesMixin from "../../src/app/VirtualValuesMixin.js";
import WildcardKeysMixin from "../../src/app/WildcardKeysMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const directory = path.join(fixturesDirectory, "virtualValues");

class VirtualFiles extends VirtualValuesMixin(ExplorableFiles) {}
const virtualFiles = new VirtualFiles(directory);

describe("VirtualValuesMixin", () => {
  it("returns virtual names for virtual values", async () => {
    const keys = await ExplorableGraph.keys(virtualFiles);
    assert.deepEqual(keys, [
      "[wildcard]",
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
    const graph = new WildcardGraph(directory);

    const value1 = await graph.get("subfolder", "virtual.txt");
    assert.equal(value1, "This text was returned for subfolder");

    const value2 = await graph.get("doesntexist", "virtual.txt");
    assert.equal(value2, "This text was returned for doesntexist");

    const value3 = await graph.get(":wildcard", "virtual.txt");
    assert.equal(value3, "This text was returned for :wildcard");
  });
});
